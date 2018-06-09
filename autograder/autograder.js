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

var { Readable, Transform } = require('stream');
var Docker = require('simple-dockerode');
var Promise = require('bluebird');
const docker = new Docker({
    Promise: Promise
}); // change if docker is running on a different server
var _ = require('lodash/core');

/**
 * Encapsulate a remote docker container.
 *
 * @private
 */
class _GradingContainer {
    constructor(dockerContainer) {
        this.container = dockerContainer;
        this.testRe = /^\[(?<score>\d*)\]\s*\((?<pass>pass|fail)\)\s*(?<name>.*?)\s*(?:\#\s*(?<comment>.*?)\s*)?$/gm;
    }

    /**
     * Build a student submission.
     * @returns {Promise} Resolves with a reference to this grading container.
     * @param {String} makefile makefile used to build app
     */
    async build(makefileStr) {
        let container = await this.container.start();

        let results;
        if (makefileStr) {
            results = await container.exec(['make', '-f-'], {
                stdin: makefileStr,
                stdout: true,
                stderr: true
        });
        } else {
            results = await container.exec(['make'], {
                stdout: true,
                stderr: true
            });
        }
        console.log(results.stdout);
    }

    /**
     * Test a student submission that's been built.
     * @returns {Promise} Resolves with a reference to this grading container.
     * @param {String} stdinStr optional
     */
    async test(stdinStr) {
        /*
        let exec = await this.container.exec({
            Cmd: ['/bin/bash', 'test.sh'],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true
        });

        await new Promise((resolve, reject) => {
            exec.start({}, (err, stdin) => {
                if (err) {
                    return reject(err);
                }
                if (stdinStr) {
                    const sender = new Readable();
                    sender.push(stdinStr);
                    sender.push(null);
                    sender.pipe(stdin);
                }
                return resolve();
            });
        });
        */

        let results = await this.container.exec(['/bin/bash', 'test.sh'], {
            stdin: stdinStr,
            stdout: true,
            stderr: true
        });

        console.log(results.stdout);
        console.log(results.stderr);

        let parse;
        let testInfo;
        let testResults = [];
        while (parse = this.testRe.exec(results.stdout)) {
            parse = parse.groups;
            testInfo = {
                score: parseInt(parse.score),
                pass: parse.pass == 'pass',
                name: parse.name,
                comment: parse.comment ? parse.comment : ''
            };
            testResults.push(_.clone(testInfo));
        }

        return testResults;
        this.container.stop();

    }

    /**
     * Parse the output of a test script.
     * @param {Stream} muxedStream stdout+stderr from executing test.sh
     * @returns {Stream} Stream of testInfo objects
     */
    _parseTestResults(muxedStream) {
        let _this = this;

        let testStdErr = new Transform({ transform(chunk, encoding, callback) { console.log(chunk.toString()); } });
        let testStdOut = new Transform({ readableObjectMode: true });
        testStdOut._transform = function(chunk, encoding, done) {
            let parse;
            let testInfo;
            console.log(chunk.toString());
            while (parse = _this.testRe.exec(chunk.toString())) {
                parse = parse.groups;
                testInfo = {
                    score: parseInt(parse.score),
                    pass: parse.pass == 'pass',
                    name: parse.name,
                    comment: parse.comment ? parse.comment : ''
                };
                this.push(_.clone(testInfo));
            }
            done();
        };
        // XXX: end this transform stream when we run out of things to read?

        this.container.modem.demuxStream(muxedStream, testStdOut, testStdErr);

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
    // TODO: toLowerCase() is a quick hack. remove later.
    assignmentId = assignmentId.toString().toLowerCase();

    if (!syncedEnvironments || forceSync) {
        _.forEach(
            await docker.listImages({
                filters: {
                    // commented because we want all images, not just one
                    // reference: [assignmentId],
                    label: ['com.grademe']
                }
            }),
            (image) => {
                // extract image name, which is the same as assignmentId
                let id = image.RepoTags[0].split(':')[0];

                // indicate that new GE's image has already been built and cache
                let env = new GradingEnvironment(id);
                env.buildPromise = Promise.resolve();
                environmentMap.set(id, env);
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
            // once built, add to the findGradingEnvironment() lookup cache
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
            OpenStdin: true,
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
        return new _GradingContainer(container);
    }
}

module.exports = {
    GradingEnvironment: GradingEnvironment,
    findGradingEnvironment: findGradingEnvironment
}