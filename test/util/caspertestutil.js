// NOTE: Cannot use ES2015 features in CasperJS test code

var login = function(_casper, name, password) {
    _casper.waitForSelector('form[action="/login"]', function() {
        _casper.fill('form[action="/login"]', {
            email: name,
            password: password
        }, true);
    });
};

var logout = function(_casper) {
    _casper.waitUntilVisible('a[href="/login?logout=1"]', function() {
        _casper.click('a[href="/login?logout=1"]');
    });
};

module.exports = {
    login: login,
    logout: logout
};
