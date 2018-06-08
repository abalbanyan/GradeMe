const { GradingEnvironment, findGradingEnvironment } = require('../autograder.js');

(async () => {
    let env = await findGradingEnvironment(12345);
    if (env) {
        console.log('run "$ make clean-docker" first');
        return 0;
    }

    console.log('A');
    env = new GradingEnvironment(12345);
    await env.buildImage('env.tar.gz', console.log);

    console.log('B');
    let container = await env.containerize(6789, 'submission.tar.gz');
    await container.build();
    let results = await container.test();

    console.log(results);
})();