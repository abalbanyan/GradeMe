const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');

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
    }
};
