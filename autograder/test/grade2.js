const { GradingEnvironment, findGradingEnvironment } = require('../autograder.js');

(async () => {
    let env = await findGradingEnvironment(12345);
    /*
    if (env) {
        console.log('run "$ make clean-docker" first');
        return 0;
    }
    */

    env = new GradingEnvironment(12345);
    await env.buildImage('UI-env.tar.gz', console.log);

    let container = await env.containerize(6789, 'UI-submission.tar.gz');

    await container.build(`CC=g++
CFLAGS=-Wall -g -std=c++11
TARGET=a.out

all: payroll.o employee.o main.o
\t$(CC) $^ -o $(TARGET)

%.o: %.cpp
\t$(CC) $(CFLAGS) -c $^

clean:
\trm -rf *.o $(TARGET)

.PHONY: clean`);

    test_json = JSON.stringify({
        "executable": "./a.out",
        "testcases": [
            {
                "name": "test 1",
                "points": 10,
                "stdin": "hey there",
                "stdout": "Software Engineer\n"
            },
            {
                "name": "test 2",
                "points": 15,
                "stdin": "howdy",
                "stdout": "hey there\n"
            }
        ]
    });

    let results = await container.test(test_json);

    console.log(results);
})();
