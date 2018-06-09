let db = require('./db.js');
let tar = require('tar');
let fs = require('fs');
const path = require('path');

/**
 * Copies a file from source to target.
 * @param {String} source 
 * @param {String} target 
 */
function copyFile(source, target) {
    var rd = fs.createReadStream(source);
    var wr = fs.createWriteStream(target);
    return new Promise(function(resolve, reject) {
      rd.on('error', reject);
      wr.on('error', reject);
      wr.on('finish', resolve);
      rd.pipe(wr);
    }).catch(function(error) {
      rd.destroy();
      wr.end();
      throw error;
    });
}

/**
 * Empties the uploads folder.
 */
function flushUploads() {
    fs.readdir('course-data/uploads', (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join('course-data/uploads', file), err => {
          if (err) throw err;
        });
      }
    });
}

/**
 * Creates a course directory, returning its path.
 * This directory is designed to store default presets for assignments made in this course.
 * 
 * @param {String} courseid
 * @returns {String} Path to the new course.
 */
function createCourse(courseid) {
    let coursedir = 'course-data/course-' + courseid + '/';
    try {
        fs.mkdirSync(coursedir);
        return coursedir;
    } catch (err) {
        return null;
    }
}

/**
 * Creates an assignment directory. This is used to store assignment variables, such as
 * the Dockerfile, Makefile, and test script. It also stores a directory, /submissions,
 * with all of the student submissions made to this assignment.
 * 
 * @param {String} assignid 
 * @returns {String} Path to the new assignment.
 */
async function createAssignment(assignid) {
    let assigndir = 'course-data/assign-' + assignid + '/';
    try {
        fs.mkdirSync(assigndir);
        fs.mkdirSync(assigndir + 'submissions/');

        // Copy default grading env files.
        await copyFile('course-data/testcase-ui-defaults', assigndir + 'Dockerfile');
        await copyFile('course-data/testcase-ui-defaults', assigndir + 'test.sh');
        await copyFile('course-data/testcase-ui-defaults', assigndir + 'test.py');
        //await copyFile('course-data/defaults/Makefile', assigndir + 'Makefile');
        //await copyFile('course-data/defaults/test.sh', assigndir + 'test.sh');

        return assigndir;
    } catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * Create a submission file. Typically submitted by a student.
 * 
 * @param {String} submission - Pathname to the uploaded submission (typically in /uploads).
 * @param {String} submissionid
 * @param {String} assignid 
 * @param {String} courseid 
 * @param {String} submissiontype - File type of the submission. 
 * @returns {String} Path to the new file.
 */
async function createSubmission(submission, submissionid, assignid, submissiontype = 'tar') {
    let assigndir = 'course-data/assign-' + assignid;
    let newsubmissionpath = assigndir + '/submissions/sub-' + submissionid + '.' + submissiontype;
    try {
        // await fs.rename(submission, newsubmissionpath);
        await copyFile(submission, newsubmissionpath);
        return newsubmissionpath;
    } catch (err) {
        return null;
    }
}

/**
 * Moves a newly uploaded spec from /uploads to the associated assignment directory.
 * PUBLICLY AVAILABLE.
 * 
 * @param {String} assignid
 * @param {String} spec - Path to the uploaded spec.
 * @param {String} spectype - Filetype of the new spec.
 * @returns Path to the new spec.
 */
async function saveSpec(assignid, spec, spectype = 'pdf') {
    let newspecpath = 'specs/' + assignid + '.' + spectype; // The assignment spec is publicly accessible.
    try {
        // await fs.rename(spec, newspecpath);
        await copyFile(spec, 'public/' + newspecpath);
        console.log(newspecpath);
        return newspecpath;
    } catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * Moves a newly uploaded file from /uploads to the associated assignment directory.
 * NOT PUBLICLY AVAILABLE.
 * 
 * @param {String} assignid
 * @param {String} uploadpath - Path to the newly uploaded file.
 * @param {String} filename - The filename in the assignment directory. TODO: Sanitize this.
 * @returns Path to the new file.
 */
async function saveAssignmentFile(assignid, uploadpath, filename) {
    let newfilepath = 'course-data/assign-' + assignid + '/' + filename;
    try {
        await copyFile(uploadpath, newfilepath);
        return newfilepath;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function makeTar(assignid, files, tarfilename) {
    let tarpath = 'course-data/assign-' + assignid + '/' + tarfilename;
    try {
        await tar.c({ gzip: false, file: tarpath}, files);
    } catch (err) {
        console.error(err);
        return null;
    }
    return tarpath;
}
async function makeEnvTar(assignid) {
    let envdir = 'course-data/assign-' + assignid + '/';
    try {
        await tar.c({ gzip: false, file: envdir + 'env.tar', C: envdir}, ['Makefile', 'test.sh', 'Dockerfile']);
    } catch (err) {
        console.error(err);
        return null;
    }
    return envdir;
}

module.exports = {
    createSubmission: createSubmission,
    createAssignment: createAssignment,
    createCourse: createCourse,
    saveSpec: saveSpec,
    saveAssignmentFile: saveAssignmentFile,
    makeTar: makeTar,
    makeEnvTar: makeEnvTar
}