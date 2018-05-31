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

var { Transform } = require('stream');
var Docker = require('dockerode');
var Promise = require('bluebird');
const docker = new Docker({
    Promise: Promise
}); // change if docker is running on a different server
var _ = require('lodash/core');

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
    async build() {
        let container = await this.container.start();
        let exec = await container.exec({
            Cmd: ['make'],
            AttachStdout: true,
            AttachStderr: true
        });

        await exec.start()

        // TODO: collect output from the build instead of printing
        this.container.modem.demuxStream(exec.output, process.stdout, process.stderr);
        return new Promise((resolve, reject) => {
            exec.output.on('end', () => resolve(this));
            exec.output.on('error', (err) => reject(err));
        });
    }

    /**
     * Test a student submission that's been built.
     * @returns {Promise} Resolves with a reference to this grading container.
     */
    async test() {
        let exec = await this.container.exec({
            Cmd: ['/bin/bash', 'test.sh'],
            AttachStdout: true,
            AttachStderr: true
        });

        await exec.start();

        let testResults = [];
        let testStream = this._parseTestResults(exec);
        testStream.on('data', (testInfo) => {
            testResults.push(testInfo);
        });

        return new Promise((resolve, reject) => {
            exec.output.on('error', reject);
            exec.output.on('end', () => {
                this.container.stop();
                resolve(testResults);
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

var environmentMap = new Map(); // assignmentIds -> GradingEnvironment
var syncedEnvironments = false;

/**
 * Query to see if Docker has a (built) GradingEnvironment image.
 * @param {string} assignmentId 
 * @param {bool} forceSync
 * @return {GradingEnvironment}
 */
async function findGradingEnvironment(assignmentId, forceSync=false) {
    if (!syncedEnvironments || forceSync) {
        _.forEach(
            await docker.listImages({ filters: { label: ['com.grademe'] }}),
            (image) => {
                let env = new GradingEnvironment(image.Id);
                env.buildPromise = Promise.resolve();
                environmentMap.set(image.Id, env);
            }
        )
        syncedEnvironments = true;
    }

    return environmentMap.get(assignmentId);
}

/**
 * Create student test containers with the same grading environment
 * @param {Number} assignmentId Uniquely identifies the image we build
 * @param {String} envArchive (opt) Tar file with Dockerfile & grading scripts
 */
class GradingEnvironment {
    constructor(assignmentId) {
        // TODO: toLowerCase() is a quick hack. remove later.
        this.imageId = assignmentId.toString().toLowerCase();
        this.buildPromise; // resolved after buildImage() finishes
    }

    /**
     * Creates an image encapsulating the grading environment.
     * 
     * The image keeps the same container ID as the assignment, and is marked
     * with the 'com.grademe' label so grademe containers can be identified
     * later.
     * 
     * @param {String}   envArchive Rebuild with a new environment
     * @param {Function} onProgress Called with progress descriptions (optional)
     */
    async buildImage(envArchive, onProgress) {
        let progressStream = await docker.buildImage(envArchive, {
            t: this.imageId,
            labels: { 'com.grademe': '' }
        })
        
        if (onProgress) {
            progressStream.on('data', (buf) => onProgress(buf.toString()));
        } else {
            progressStream.on('data', (buf) => {});
        }

        this.buildPromise = new Promise((resolve, reject) => {
            progressStream.on('end', resolve);
            progressStream.on('error', reject);
        }).then(() => {
            environmentMap.set(this.assignmentId, this);
        });
        return this.buildPromise;
    }

    /**
     * Create a container environment with submitted code
     * @param {Number} userId     Identifier representing the student
     * @param {String} srcArchive Tarball containing student source code
     * @return {Gradingcontainer}
     */
    async containerize(userId, srcArchive) {
        try {
            await this.buildPromise;
        } catch (error) {
            throw new Error("Grading envrionment image not built yet; " +
                            "call buildImage() first");
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
    findGradingEnvironment: findGradingEnvironment
}