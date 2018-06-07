const mongoose = require('mongoose');
const app = require('../../app.js');
const MongodbMemoryServer = require('mongodb-memory-server');
const util = require('./util');

mongoose.Promise = Promise;

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

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
    createTestUser: util.createTestUser,
    createTestAssignment: util.createTestAssignment
};
