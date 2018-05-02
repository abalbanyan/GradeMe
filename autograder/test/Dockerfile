# Dockerfile Requirements
# - Makefile: running `make` in student's project root should build a binary.
# - test.sh: executing `./test.sh` in student's project root should run tests.
#
# ${SUBMISSION_TAR} will be replaced with the name of the tarball containing a
# student submission.

FROM gcc:7
COPY Makefile test.sh /usr/src/app/
WORKDIR /usr/src/app/
ADD ${SUBMISSION_TAR} /usr/src/app/
RUN make
CMD ['/bin/bash', 'test.sh']
