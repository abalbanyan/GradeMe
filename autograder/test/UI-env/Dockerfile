# default dockerfile for testcase-ui

# Dockerfile Requirements
# - test.sh: executing `./test.sh` in student's project root should run tests.
# - base image must have `make` and `bash` installed.

FROM gcc:7
WORKDIR /usr/src/app
CMD ['/bin/bash', 'test.sh']
COPY test.sh test.py ./