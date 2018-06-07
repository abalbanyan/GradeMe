var util = require('../util/caspertestutil.js');

// Our app only needs to work on desktop
casper.options.viewportSize = { width: 1920, height: 1080 };

// NOTE: We can't simply loop through all user types since CasperJS
// does some code injection that doesn't play nicely with loops

casper.test.begin('Able to login as admin', 4, function suite(test) {
    casper.start('http://localhost:3200', function() {
        this.waitForSelector('form[action="/login"]', function() {
            test.assertExists('form[action="/login"]', 'login form is found');
            this.fill('form[action="/login"]', {
                email: 'admin@grademe.edu',
                password: 'admin'
            }, true);
        });
    });

    casper.waitForUrl(/courses/, function() {
        test.assertUrlMatch(/courses/, "redirected to courses page after logging in as admin");

        // Note: buttons need to be visible in order to for click to work
        this.waitUntilVisible('a[href="/login?logout=1"]', function() {
            test.assertVisible('a[href="/login?logout=1"]', 'logout button is visible');
            this.click('a[href="/login?logout=1"]');
        });
    });

    casper.waitForUrl(/login\?logout=1/, function() {
        test.assertUrlMatch(/login\?logout=1/, "logging out brings back to login page");
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin('Able to login as instructor', 4, function suite(test) {
    casper.start('http://localhost:3200', function() {
        this.waitForSelector('form[action="/login"]', function() {
            test.assertExists('form[action="/login"]', 'login form is found');
            this.fill('form[action="/login"]', {
                email: 'instructor_enrolled@grademe.edu',
                password: 'instructor_enrolled'
            }, true);
        });
    });

    casper.waitForUrl(/courses/, function() {
        test.assertUrlMatch(/courses/, "redirected to courses page after logging in as admin");

        // Note: buttons need to be visible in order to for click to work
        this.waitUntilVisible('a[href="/login?logout=1"]', function() {
            test.assertVisible('a[href="/login?logout=1"]', 'logout button is visible');
            this.click('a[href="/login?logout=1"]');
        });
    });

    casper.waitForUrl(/login\?logout=1/, function() {
        test.assertUrlMatch(/login\?logout=1/, "logging out brings back to login page");
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin('Able to login as student', 4, function suite(test) {
    casper.start('http://localhost:3200', function() {
        this.waitForSelector('form[action="/login"]', function() {
            test.assertExists('form[action="/login"]', 'login form is found');
            this.fill('form[action="/login"]', {
                email: 'student_enrolled@grademe.edu',
                password: 'student_enrolled'
            }, true);
        });
    });

    casper.waitForUrl(/courses/, function() {
        test.assertUrlMatch(/courses/, "redirected to courses page after logging in as admin");

        // Note: buttons need to be visible in order to for click to work
        this.waitUntilVisible('a[href="/login?logout=1"]', function() {
            test.assertVisible('a[href="/login?logout=1"]', 'logout button is visible');
            this.click('a[href="/login?logout=1"]');
        });
    });

    casper.waitForUrl(/login\?logout=1/, function() {
        test.assertUrlMatch(/login\?logout=1/, "logging out brings back to login page");
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin('Unable to login with invalid credentials', 3, function suite(test) {
    casper.start('http://localhost:3200', function() {
        this.waitForSelector('form[action="/login"]', function() {
            test.assertExists('form[action="/login"]', 'login form is found');
            this.fill('form[action="/login"]', {
                email: 'fake@grademe.edu',
                password: 'fake'
            }, true);
        });
    });

    casper.then(function() {
        this.waitUntilVisible('div.alert-danger', function() {
            test.assertVisible('div.alert-danger', 'displays error message');
            var value = this.fetchText('div.alert-danger').indexOf('Error: incorrect username or password') !== -1;
            test.assert(value, 'Displays correct error message');
        });
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin('Error message displayed when no form data given', 3, function suite(test) {
    casper.start('http://localhost:3200', function() {
        this.waitForSelector('form[action="/login"]', function() {
            test.assertExists('form[action="/login"]', 'login form is found');
            this.fill('form[action="/login"]', {
                email: '',
                password: ''
            }, true);
        });
    });

    casper.then(function() {
        this.waitUntilVisible('div.alert-danger', function() {
            test.assertVisible('div.alert-danger', 'displays error message');
            var value = this.fetchText('div.alert-danger').indexOf('Error: missing username or password') !== -1;
            test.assert(value, 'Displays correct error message');
        });
    });

    casper.run(function() {
        test.done();
    });
});
