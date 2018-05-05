# Dockerfile Requirements
# - Makefile: running `make` in student's project root should build a binary.
# - test.sh: executing `./test.sh` in student's project root should run tests.
#
# ${SUBMISSION_TAR} will be replaced with the name of the tarball containing a
# student submission.

FROM gcc:7
ARG APPDIR
WORKDIR $APPDIR
CMD ['/bin/bash', 'test.sh']
COPY Makefile test.sh ./