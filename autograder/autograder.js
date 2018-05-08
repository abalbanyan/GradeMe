/* autograder.js
 *
 * environment_tgz contains
 * - Makefile
 * - Dockerfile
 * - test.sh
 *
 * images named by assignmentid::userid
 * containers named by assignmentid::userid
 *
 * archive formats supported by Docker:
 * - .tar
 * - .tar.gz
 * - .tar.bz2
 * - .tar.xz
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

    build() {
        this.container.start()
        .then((container) =>
            container.exec({
                Cmd: ['/bin/bash', '-c', 'make'],
                AttachStdout: true,
                AttachStderr: true
            })
        ).then((exec) => {
            // TODO: promisify this; don't like these callbacks
            exec.start((err, stream) => {
                this.container.modem.demuxStream(stream, process.stdout, process.stdin);
                exec.inspect((err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(data);
                    }
                });
            });
        });
    }

    test() {
        console.log('have a listen to avocado andrew; short song, big mood');
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
        this.appDir = '/usr/src/app/';
        this.buildPromise = null;
    }

    /**
     * Creates an image encapsulating the grading environment
     * @param   {Function} onProgress Called with progress descriptions (optional)
     */
    buildImage(onProgress) {
        this.buildPromise = docker.buildImage(this.envArchive, {
            t: this.imageId,
            buildargs: {
                APPDIR: this.appDir
            }
        }).then((stream) => {
            console.log(stream.statusCode);
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
                Tty: false,
                OpenStdin: false,
                StdinOnce: false,
                AutoRemove: true
            })
        ).then((container) =>
            // XXX: potential to overwrite TA files with student files?
            container.putArchive(this.srcArchive, {
                path: '/usr/src/app', // path inside the container
                noOverwriteDirNonDir: true
            }).then(() =>
                new GradingContainer(container)
            )
        );
    }
}

module.exports = GradingEnvironment;