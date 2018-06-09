let nev = require('../../../grademe-email-verification')();
let User = require('../../../models/User');
let TempUser = require('../../../models/TempUser');
let util = require('../../util/jestutil.js');

let mongoServer;
let testUserObject = util.createTestUserObject('student', 'willBeTemp');
let existingUserObject = util.createTestUserObject('instructor', 'existing');
let existingUser = util.createTestUser('instructor', 'existing');
let testTempUser = util.createTestTempUser('student', 'temp', 'abcd', ['123','456']);
let existingTestTempUser = util.createTestUser('student', 'temp');
let tempUserToConfirm = util.createTestTempUser('student', 'togos', 'happyURL', ['123','456'])

beforeAll(async () => {
    mongoServer = await util.mongo.start();
    await existingUser.save();
    await testTempUser.save();
    await tempUserToConfirm.save();
    nev.configure({
        shouldSendConfirmation: false
    }, (err, options) => {});
});

afterAll(() => {
    util.mongo.stop(mongoServer);
});


describe('createTempUser (and insertTempUser)', () => {  // check DB, check kind is TempUser
    test('create and insert temp user', (done) => {
        nev.createTempUser(testUserObject, [], async (err, persistentUser, tempUser) => {
            let tempUserFound = await TempUser.findById(tempUser._id).exec();
            expect(err).toBeNull();
            expect(persistentUser).toBeNull();
            expect(tempUserFound).toBeDefined();
            expect(tempUserFound._id).toEqual(tempUser._id);
            expect(tempUserFound.kind).toEqual('TempUser');
            done();
        });
    });
    
    test('attempt to insert existing user', async (done) => {
        nev.createTempUser(existingUserObject, [], (err, persistentUser, tempUser) => {
            expect(err).toBeNull();
            expect(persistentUser != null).toBe(true); 
            expect(tempUser).toBeNull();
            done();
        });
    });
    
    test('attempt to insert existing temp user', (done) => {
        nev.createTempUser(testTempUser, testTempUser.enroll_codes, (err, persistentUser, tempUser) => {
            expect(err).toBeNull();
            expect(persistentUser).toBeNull();
            expect(tempUser).toBeNull();
            done();
        });
    });
    
});

describe('confirmTempUser', () => {  // check DB, check kind has changed to User
    test('check that user is changed from kind: TempUser to User', (done) => {
        nev.confirmTempUser(tempUserToConfirm.GENERATED_VERIFYING_URL, (err, user, codes) => {
            expect(err).toBeNull();
            expect(user != null).toBe(true);
            expect(user.kind).toEqual("User");
            done();
        });
    });
    
});
