var util = require('../util/caspertestutil.js');

// Our app only needs to work on desktop
casper.options.viewportSize = { width: 1920, height: 1080 };

// function getCourseLinks() {
//     var listElements = document.querySelectorAll('li.list-group-item a');
//     return Array.prototype.map.call(listElements, function (e) {
//         var linkName = e.getAttribute('href');
//         if(linkName.indexOf('course') !== -1) {
//             return linkName;
//         }
//     });
// }

// var courseLinks = [];

casper.test.begin('Navigate to a specific course page', 5, function suite(test) {
    casper.start('http://localhost:3200');

    casper.then(function() {
        util.login(this, 'admin@grademe.edu', 'admin');
    });

    casper.waitForUrl(/courses/, function() {
        test.assertElementCount('a.course-link', 2);
        this.waitUntilVisible('a.course-link', function() {
            this.click('a.course-link');
        });
    });

    casper.waitForUrl(/course\?courseid=.+/, function() {
        test.assertVisible('h2#course-title', 'Course title visible');
        test.assertVisible('a.assignment-link', 'Assignment link visible');
        test.assertVisible('div.create-assignment-text', 'Create assignment button visible');
        test.assertVisible('a[href="/courses"]');
        this.click('a[href="/courses"]');
    });

    casper.then(function() {
        // Need to logout after finishing tests
        util.logout(this);
    });

    casper.run(function() {
        test.done();
    });
});
