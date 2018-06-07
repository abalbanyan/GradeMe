// NOTE: Cannot use ES2015 features in CasperJS test code

var login = function(_casper, name, password) {
    _casper.waitForSelector('form[action="/login"]', function() {
        _casper.fill('form[action="/login"]', {
            email: name,
            password: password
        }, true);
    });
};

module.exports = {
    login: login
};
