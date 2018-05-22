/* autograder.js
 *
 * environment_tgz contains
 * - Makefile
 * - Dockerfile
 * - test.sh
 *
 * images named by assignmentid
 * containers named by assignmentid-userid
 *
 * archive formats supported by Docker:
 * - .tar
 * - .tar.gz
 * - .tar.bz2
 * - .tar.xz
 * 
 * TODO:
 * - better managment of running container instances:
 *   - running containers cannot be rebuilt, must be stopped first
 *   - no retesting because we close the docker container
 * - parse make output
 * - specify a test script format to parse
 * - give TAs control over appdir using Dockerfile
 * - give TAs control over name testing command/script
 */

var Docker = require('dockerode');
var Promise = require('bluebird');
var docker = new Docker({
    Promise: Promise
}); // change if docker is running on a different server
var _ = require('lodash/core');

const { Transform } = require('stream');

var envMap = new Map(); // TODO: assumes that Node.js will never crash?

// Wrap a dockerode container and expose a nicer API

function actuallyGrade(arr) {
    current = 0;
    total_score = 0;

    for (let i of arr) {
        if (i.pass) {
            current += i.score;
        }
        total_score += i.score
    }

    return [current, total_score];
}

/**
 * Does this docker image exist?
 * @param {String} imageId
 * @returns {Boolean}
 */
async function imageExists(imageId) {
    const images = await docker.listImages({ filters: { reference: [imageId] } });
    return (images.length > 0);
}

class GradingContainer {
    constructor(dockerContainer) {
        this.container = dockerContainer;
        this.testRe = /^\[(?<score>\d*)\]\s*\((?<pass>pass|fail)\)\s*(?<name>.*)\s*(?:\#(?<comment>.*))?/gm;
        this.exec = null;
    }

    /**
     * Build a student submission.
     * @returns {Promise} Resolves with a reference to this grading container.
     */
    build() {
        return this.container.start()
        .then((container) => 
            container.exec({
                Cmd: ['make'],
                AttachStdout: true,
                AttachStderr: true
            })
        ).then((exec) =>
            exec.start()
        ).then((exec) => {
            // TODO: collect output from the build instead of printing
            this.container.modem.demuxStream(exec.output, process.stdout, process.stderr);
            return new Promise((resolve, reject) => {
                exec.output.on('end', () => resolve(this));
                exec.output.on('error', (err) => reject(err));
            });
        });
    }

    /**
     * Test a student submission that's been built.
     * @returns {Promise} Resolves with a reference to this grading container.
     */
    test() {
        return this.container.exec({
            Cmd: ['/bin/bash', 'test.sh'],
            AttachStdout: true,
            AttachStderr: true
        }).then((exec) =>
            exec.start()
        ).then((exec) => {
            let testArray = [];
            let testStream = this._parseTestResults(exec);

            testStream.on('data', (testInfo) => {
                testArray.push(testInfo);
            });

            return new Promise((resolve, reject) => {
                exec.output.on('error', reject);
                exec.output.on('end', () => {
                    this.container.stop();
                    resolve(testArray);
                });
            });
        });
    }

    /**
     * Parse the output of a test script.
     * @param {Exec} exec stdout from executing test.sh
     * @returns {Stream} Stream of testInfo objects
     */
    _parseTestResults(exec) {
        let _this = this;

        let testStdErr = new Transform({ transform(chunk, encoding, callback) {} });
        let testStdOut = new Transform({readableObjectMode: true});
        testStdOut._transform = function(chunk, encoding, done) {
            let parse;
            let testInfo = {};
            do {
                parse = _this.testRe.exec(chunk.toString());
                if (parse) {
                    parse = parse.groups;
                    testInfo.score = parseInt(parse.score);
                    testInfo.pass = parse.pass == 'pass';
                    testInfo.name = parse.name;
                    testInfo.comment = parse.comment ? parse.comment : '';
                    this.push(_.clone(testInfo));
                }
            } while(parse);
            done();
        };
        // XXX: end this transform stream when we run out of things to read?

        this.container.modem.demuxStream(exec.output, testStdOut, testStdErr);

        return testStdOut;
    }
}

/**
 * Create student test containers with the same grading environment
 * @param {Number} assignmentId Uniquely identifies the image we build
 * @param {String} envArchive (opt) Tar file with Dockerfile & grading scripts
 */
class GradingEnvironment {
    constructor(assignmentId, envArchive) {
        this.envArchive = envArchive;
        this.imageId = assignmentId.toString().toLowerCase(); // TODO: toLowerCase() is a quick hack. remove later.
        this.buildPromise = null;
        this.imageBuilt = false;
    }

    /**
     * Initialize this grading environment. 
     * Checks whether an image already exists, and uses that image, otherwise creates a new one.
     * @param {Boolean} rebuild Rebuild the docker image with a new envArchive (optional).
     * @param {Function} onProgress Called with progress descriptions (optional). 
     */
    async init(rebuild = false, onProgress = false) {
        if (!this.imageId) throw new Error('No image id provided.');
        if (this.buildPromise) return;

        if (rebuild || !(await imageExists(this.imageId))) {
            this.buildPromise = this.buildImage(this.envArchive); // Build new image.
        } else {
            this.imageBuilt = true;
            // this.buildPromise = docker.getImage(this.imageId).get(); // Retrieve old image.
        }
    }

    /**
     * Creates an image encapsulating the grading environment.
     * @private
     * @param {String}   envArchive Rebuild with a new environment
     * @param {Function} onProgress Called with progress descriptions (optional)
     */
    buildImage(envArchive, onProgress) {
        if (typeof envArchive === 'string') {
            this.envArchive = envArchive;
        }
        if (typeof envArchive === 'function') {
            onProgress = envArchive;
        }

        this.buildPromise = docker.buildImage(this.envArchive, {
            t: this.imageId,
            buildargs: {}
        }).then((stream) => {
            if (onProgress) {
                stream.on('data', (buf) => onProgress(buf.toString()));
            } else {
                stream.on('data', (buf) => {});
            }
            return new Promise((resolve, reject) => {
                stream.on('end', resolve);
                stream.on('error', reject);
            });
        });
    }

    /**
     * Create a container environment with submitted code
     * @param {Number} userId     Identifier representing the student
     * @param {String} srcArchive Tarball containing student source code
     * @returns {Promise} Resolves to a GradingContainer
     */
    async containerize(userId, srcArchive) {
        if (!this.imageBuilt && !this.buildPromise) {
            return Promise.reject(new Error('Call buildImage() first'));
        }

        if (!this.imageBuilt) {
            await this.buildPromise;
            this.imageBuilt = true;
        }

        let container = await docker.createContainer({
            name: this.imageId + '-' + userId,
            Image: this.imageId,
            AttachStdin: false,
            AttachStdout: false,
            AttachStderr: true,
            Tty: true,
            OpenStdin: false,
            StdinOnce: false,
            AutoRemove: true,
            Entrypoint: ['/bin/bash']
        });
        // XXX: potential to overwrite TA files with student files?
        // TODO: archive upload not working
        await container.putArchive(srcArchive, {
            path: '/usr/src/app', // not relative to WORKDIR :<
            noOverwriteDirNonDir: false
        });
        return new GradingContainer(container);
    }
}

module.exports = {
    GradingEnvironment: GradingEnvironment,
    actuallyGrade: actuallyGrade
}