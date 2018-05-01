var autograder = require('../autograder.js');
var env = new autograder('environment.tar.gz', 12345);
env.containerize('submission.tar.gz')
.then((container) => console.log(container));
