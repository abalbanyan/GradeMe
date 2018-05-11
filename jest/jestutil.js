const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');
const User = require('../models/User.js');
const Assignment = require('../models/Assignment.js');

mongoose.Promise = Promise;

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const admin = new User({
    email: 'admin@grademe.edu',
    name: {first: "Joe", last: "Bruin"},
    password: 'admin',
    instructor: true,
    admin: true
});

const danny = new User({
    email: 'danny@gmail.com',
    password: 'monkey',
    instructor: false,
    admin: false,
    name: {first: "Danny", last: "Jung"}
});

const willy = new User({
    email: 'willy@gmail.com',
    password: 'mindi',
    instructor: true,
    name: {first: 'William', last: 'Hsiao'},
    admin: false
});

const assignment = new Assignment({
    name: "GradeMe",
    desc: "this lmao",
    duedate: new Date(2020, 1, 1),
    spec: {
        path: 'specs/loremipsum.pdf',
        filetype: 'pdf'
    },
});

const startMongo = async () => {
    let mongoServer = new MongodbMemoryServer.default();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, (err) => {
        if (err) console.error(err);
    });

    return mongoServer;
};

const stopMongo = (mongoServer) => {
    mongoose.disconnect();
    mongoServer.stop();
};

module.exports = {
    mongo: {
        start: startMongo,
        stop: stopMongo
    },
    example: {
        student: danny,
        instructor: willy,
        admin: admin,
        assignment: assignment
    }
};
