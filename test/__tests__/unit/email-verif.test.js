let nev = require('../../../grademe-email-verification')();
let User = require('../../../models/User');
let TempUser = require('../../../models/TempUser');
let util = require('../../util/jestutil.js');

let mongoServer;
let testUserObject = util.createTestUserObject('student', 'willBeTemp');
let existingUser = util.createTestUser('instructor', 'existing');
let testTempUser = util.createTestTempUser('student', 'temp', 'abcd', ['123','456']);
let existingTestTempUser = util.createTestUser('student', 'temp');

beforeAll(async () => {
    mongoServer = await util.mongo.start();
    await existingUser.save();
    await testTempUser.save();
});


describe('createTempUser (and insertTempUser)', () => {  // check DB, check kind is TempUser
    // test('create and insert temp user', () => {
    //     console.log('RUNNING FIRST TEST');
    //     nev.createTempUser(testUserObject, [], async (err, persistentUser, tempUser) => {
    //         let tempUserFound = await TempUser.findById(tempUser._id).exec();
            
    //         console.log('ERROR IN FIRST TEST:' + err);
    //         if (!err) {
    //             console.log('FIRST TEST IS OKAY');
    //             expect(err).toBeNull();
    //             expect(persistentUser).toBeNull();
    //             expect(tempUserFound).toBeDefined();
    //             expect(tempUserFound._id).toEqual(tempUser._id);
    //             expect(tempUserFound.kind).toEqual('TempUser');
    //         }
    //     });
    // });
    
    // test('attempt to insert existing user', () => {
    //     nev.createTempUser(existingUser, [], (err, persistentUser, tempUser) => {
    //         console.log('ERROR IN SECOND TEST:' + err);
    //         if (!err) {
    //             expect(err).toBeNull();
    //             expect(persistentUser).toBeDefined();
    //             expect(tempUser).toBeNull();
    //         }
    //     });
    // });
    
    test('attempt to insert existing temp user', async () => {
        let tempUserFound = await TempUser.findOne({email: existingTestTempUser.email}).exec();
        expect(tempUserFound).toBeDefined();
        
        nev.createTempUser(testTempUser, testTempUser.enroll_codes, (err, persistentUser, tempUser) => {
            console.log('ERROR IN THIRD TEST:' + err);
            if (!err) {
                expect(testTempUser).toBeDefined();
                expect(err).toBeNull();
                expect(persistentUser).toBeNull();
                expect(tempUser).toBeNull();
            }
        });
    });
    
});

describe('sendVerificationEmail', () => {  // if there's no easy way to test this, assume that nodemailer is tested and works
test('', async () => {
    
});

});

describe('confirmTempUser', () => {  // check DB, check kind has changed to User
    test('', async () => {
        
    });
    
});

describe('sendConfirmationEmail', () => {  // same as verification email
    test('', async () => {
        
    });
    
});

describe('resendVerificationEmail', () => {  // just check URL in DB has changed (check val before calling func)
    test('', async () => {
        
    });
    
});

afterAll(() => {
    // util.mongo.stop(mongoServer);
});