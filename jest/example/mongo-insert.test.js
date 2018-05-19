const jestutil = require('../jestutil.js');
const User = require('../../models/User.js');

let mongoServer;

beforeAll(async () => {
    mongoServer = await jestutil.mongo.start();
});

afterAll(() => {
    jestutil.mongo.stop(mongoServer);
});

it('should insert a user into the database', async () => {
    let willy = jestutil.createTestUser("instructor", "Will Hsiao");


    // new User({
    //     email: 'willy@gmail.com',
    //     password: 'mindi',
    //     instructor: true,
    //     name: {first: 'William', last: 'Hsiao'}
    // });
    await willy.save();

    let user = await User.findById(willy._id).exec();
    expect(user.name.first).toEqual(willy.name.first);
});
