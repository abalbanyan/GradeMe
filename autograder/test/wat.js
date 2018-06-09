const { _GradingContainer } = require('../autograder');
const { Transform } = require('stream');
var _ = require('lodash/core');

var testRe = /^\[(?<score>\d*)\]\s*\((?<pass>pass|fail)\)\s*(?<name>.*?)\s*(?:\#\s*(?<comment>.*?)\s*)?$/gm

function _parseTestResults() {
    let testStdErr = new Transform({ transform(chunk, encoding, callback) {} });
    let testStdOut = new Transform({ readableObjectMode: true });
    testStdOut._transform = function(chunk, encoding, done) {
        let parse;
        let testInfo;
        while (parse = testRe.exec(chunk.toString())) {
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

    //this.container.modem.demuxStream(exec.output, testStdOut, testStdErr);

    return testStdOut;
}

var testObjTransform = _parseTestResults();
process.stdin.pipe(testObjTransform);
testObjTransform.on('data', console.log);