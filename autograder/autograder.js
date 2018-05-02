var Docker = require('dockerode');
var docker = new Docker(); // change if docker is running on a different server

// environment_tgz contains Makefile, Dockerfile, and test.sh
// images named by assignmentid
// containers named by assignmentid::userid

class GradingContainer {
    constructor(env, userId, srcArchive) {
        this.env = env;
        this.userId = userId;
        this.srcArchive = srcArchive;
    }

    // make container, copy srcArchive into container, unpack
    _mkContainer() {
        docker.createContainer(this.env.assignmentId, );
    }

    build() {
        return;
    }

    test() {
        return;
    }
}

class GradingEnvironment {
    // archive format: tar, tar.gz, tar.bz2, tar.xz
    constructor(envArchive, assignmentId) {
        this.envArchive = envArchive;
        this.assignmentId = assignmentId;
        this.built = false;
    }

    // buildImage([onProgress])
    buildImage(onProgress) {
        return new Promise((resolve, reject) => {
            docker.buildImage(this.envArchive, {t: this.assignmentId})
            .then((stream) => {
                console.log(stream.statusCode);
                if (onProgress) {
                    stream.on('data', (buf) => onProgress(buf.toString()));
                } else {
                    stream.on('data', (buf) => {});
                }
                stream.on('end', () => {
                    this.built = true;
                    resolve();
                });
                stream.on('error', reject);
            });
        });

    }

    containerize(srcArchive) {
        let new_gc = new GradingContainer(this, 123456789, srcArchive);

        if (!this.built) {
            return this.buildImage().then(() => {
                return new_gc;
            });
        } else {
            return Promise.resolve(new_gc);
        }
    }
}

module.exports = GradingEnvironment;
