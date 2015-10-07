var should = require('should');

var tokenize = require("../lib");

describe('tokenize.re()', function() {

    it('should correctly extract using a regex', function() {
        var extractUppercase = tokenize.re(/[A-Z]/);
        var tokens = extractUppercase('aBcD');

        tokens.should.have.lengthOf(2);
        tokens[0].value.should.equal('B');
        tokens[0].index.should.equal(1);
        tokens[1].value.should.equal('D');
        tokens[1].index.should.equal(3);
    });
});

