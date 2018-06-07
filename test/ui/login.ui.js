// Our app only needs to work on desktop
casper.options.viewportSize = { width: 1920, height: 1080 };

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
