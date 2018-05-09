let db = require('./db.js');
let fs = require('fs');

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
function createAssignment(assignid) {
    let assigndir = 'course-data/assign-' + assignid + '/';
    try {
        fs.mkdirSync(assigndir);
        fs.mkdirSync(assigndir + 'submissions/');
        return assigndir;
    } catch (err) {
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
 * 
 * @param {String} assignid
 * @param {String} spec - Path to the uploaded spec.
 * @param {String} spectype - Filetype of the new spec.
 * @returns Path to the new spec.
 */
async function changeSpec(assignid, spec, spectype = 'pdf') {
    let newspecpath = 'specs/' + assignid + '.' + spectype; // The assignment spec is publicly accessible.
    try {
        // await fs.rename(spec, newspecpath);
        await copyFile(spec, 'public/' + newspecpath);
        return newspecpath;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = {
    createSubmission: createSubmission,
    createAssignment: createAssignment,
    createCourse: createCourse,
    changeSpec: changeSpec
}