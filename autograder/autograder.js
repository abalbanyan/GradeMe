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

// Wrap a dockerode container and expose a nicer API
class GradingContainer {
    constructor(dockerContainer) {
        this.container = dockerContainer;
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
        this.container.exec({
            Cmd: ['/bin/bash', 'test.sh'],
            AttachStdout: true,
            AttachStderr: true
        }).then((exec) =>
            exec.start()
        ).then((exec) => {
            // TODO: collect output from the tests instead of printing
            this.container.modem.demuxStream(exec.output, process.stdout, process.stderr);
            return new Promise((resolve, reject) => {
                exec.output.on('end', () => {
                    this.container.stop(); // calling test() twice results in an error
                    resolve(this);
                });
                exec.output.on('error', (err) => reject(err));
            });
        });
    }
}

/**
 * Create student test containers with the same grading environment
 * @param {String} envArchive   Tar file with Dockerfile & grading scripts
 * @param {Number} assignmentId Uniquely identifies the image we build
 */
class GradingEnvironment {
    constructor(envArchive, assignmentId) {
        this.envArchive = envArchive;
        this.imageId = assignmentId.toString();
        this.buildPromise = null;
    }

    /**
     * Creates an image encapsulating the grading environment
     * @param   {Function} onProgress Called with progress descriptions (optional)
     */
    buildImage(onProgress) {
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
     * @param {String} srcArchive Tarball containing student source code
     * @param {Number} userId     Identifier representing the student
     * @returns {Promise} Resolves to a GradingContainer
     */
    containerize(srcArchive, userId) {
        if (!this.buildPromise) {
            return Promise.reject(new Error('Call buildImage() first'));
        }

        return this.buildPromise.then(() =>
            docker.createContainer({
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
            })
        ).then((container) =>
            // XXX: potential to overwrite TA files with student files?
            // TODO: archive upload not working
            container.putArchive(srcArchive, {
                path: '/usr/src/app', // not relative to WORKDIR :<
                noOverwriteDirNonDir: false
            }).then((_) =>
                new GradingContainer(container)
            )
        );
    }
}

module.exports = GradingEnvironment;