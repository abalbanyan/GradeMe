var autograder = require('../autograder.js');
var env = new autograder(12345, 'env.tar.gz'); // changed arg order!
env.buildImage();
env.containerize(6789, 'submission.tar.gz') // changed arg order!
.then((container) => container.build())
.then((container) => container.test())
.then((results) => console.log(results))
.catch((err) => console.log(err));