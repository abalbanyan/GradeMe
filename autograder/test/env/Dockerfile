# Dockerfile Requirements
# - Makefile: running `make` in student's project root should build a binary.
# - test.sh: executing `./test.sh` in student's project root should run tests.
# - base image must have `make` and `bash` installed.

FROM gcc:7
WORKDIR /usr/src/app
CMD ['/bin/bash', 'test.sh']
COPY Makefile test.sh ./