var should = require('should');

var tokenize = require("../lib");

describe('tokenize.sections()', function() {
    it('should split by .', function() {
        var tokens = tokenize.sections()('this is sentence 1. this is sentence 2');
        tokens.should.have.lengthOf(2);

        tokens[0].value.should.equal('this is sentence 1');
        tokens[0].index.should.equal(0);
        tokens[0].offset.should.equal(18);

        tokens[1].value.should.equal(' this is sentence 2');
        tokens[1].index.should.equal(19);
        tokens[1].offset.should.equal(19);
    });
});

