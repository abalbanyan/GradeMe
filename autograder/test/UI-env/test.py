#!/usr/bin/env python3

import sys
import json
import subprocess

def main():
    test_info = json.load(sys.stdin)

    for testcase in test_info['testcases']:
        result = subprocess.run(
            test_info['executable'].split(),
            input=testcase['stdin'],
            stdout=subprocess.PIPE,
            universal_newlines=True
        )

        #print(result.stdout)
        #print(testcase['stdout'])

        print('[{}] ({}) {}'.format(
                testcase['points'],
                'pass' if result.stdout == testcase['stdout'] else 'fail',
                testcase['name']
            )
        )

if __name__ == '__main__':
    main()
