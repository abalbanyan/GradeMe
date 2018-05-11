const { GradingEnvironment, actuallyGrade } = require('../autograder.js');
var env = new GradingEnvironment(12345, 'env.tar.gz'); // changed arg order!
env.buildImage();
var env2 = new GradingEnvironment(12345, 'env.tar.gz');
env2.containerize(6789, 'submission.tar.gz') // changed arg order!
.then((container) => container.build())
.then((container) => container.test())
.then((results) => console.log(actuallyGrade(results)))
.catch((err) => console.log(err));