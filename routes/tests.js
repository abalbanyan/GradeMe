var express = require('express');
var router =  express.Router();
var db = require('../db.js');
var { isCourseInstructor } = db.utils;
var _ = require('lodash/core');

async function isAuthorized(assignId, user) {
    const userId = user._id;
    const isInstructor = user.instructor;

    return assignId && isInstructor && (await isCourseInstructor(
        (await db.Course.findOne({ assignments: assignId }).exec())._id,
        userId
    ));
}

router.get('/', async (req, res) => {
    console.log(res.locals.user);
    if (!(await isAuthorized(req.query.assignid, res.locals.user))){
        return res.status(403).render('error', {
            message: "You do not have access to this assignment."
        });
    }
    
    let tests = await db.TestCase.find({ assignid: req.query.assignid }).exec();
    let assignment = await db.Assignment.findById(req.query.assignid).exec();

    return res.status(200).render('tests', {
        testcases_meta: assignment.testcases_meta,
        tests: tests
    });
});

router.post('/', async (req, res) => {
    let required = ['name', 'stdin', 'stdout'];
    if (!required.every(prop => prop in req.body)) {
        return res.status(400).json({
            name: 'Error',
            message: 'Not all required fields were given'
        });
    }

    if (!(await isAuthorized(req.query.assignid, res.locals.user))) {
        return res.status(401).json({
            name: 'Error',
            message: 'Unauthorized to create testcases'
        });
    }

    try {
        await db.TestCase.create({
            assignid: req.query.assignid,
            name: req.body.name,
            stdin: req.body.stdin,
            stdout: req.body.stdout
        }).exec();
    } catch(e) {
        return res.status(500).json({
            name: e.name,
            message: e.message
        });
    }

    return res.status(201).end();
});

router.put('/', async (req, res) => {
    let required = ['testid'];
    if (!required.every(prop => prop in req.body)) {
        return res.status(400).json({
            name: 'Error',
            message: 'Not all required fields were given'
        });
    }

    let testcase = await db.TestCase.findById(req.body.testid).exec();
    if (!(await isAuthorized(testcase.assignid, res.locals.user))) {
        return res.status(401).json({
            name: 'Error',
            message: 'Unauthorized to modify testcases'
        });
    }

    let delta = {
        name: req.body.name,
        stdin: req.body.stdin,
        stdout: req.body.stdout
    }

    try {
        testcase.set(delta);
        await testcase.save();
    } catch (e) {
        return res.status(500).json({
            name: e.name,
            message: e.message
        });
    }

    return res.status(200).end();
});

router.delete('/', async (req, res) => {
    let required = ['testid'];
    if (!required.every(prop => prop in req.body)) {
        return res.status(400).json({
            name: 'Error',
            message: 'Not all required fields were given'
        });
    }

    let testcase = await db.TestCase.findById(req.body.testid).exec();
    if (!(await isAuthorized(testcase.assignid, res.locals.user))) {
        return res.status(401).json({
            name: 'Error',
            message: 'Unauthorized to delete testcases'
        });
    }

    try {
        await db.TestCase.findByIdAndDelete(testcase.id).exec();
    } catch(e) {
        return res.status(500).json({
            name: e.name,
            message: e.message
        });
    }

    return res.status(204).end();
});

module.exports = router;