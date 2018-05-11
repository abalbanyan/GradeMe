var autograder = require('../autograder.js');
var env = new autograder('env.tar.gz', 12345);
env.buildImage();
env.containerize('submission.tar.gz', 6789)
.then((container) => container.build())
.then((container) => container.test())
.catch((err) => console.log(err));