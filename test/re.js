var tokenize = require("./instance");

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

    it('should accept option to split instead of extracting', function() {
        var extract = tokenize.re(/\ /i, { split: true });
        var tokens = extract('hello world');

        tokens.should.have.lengthOf(3);
        tokens[0].value.should.equal('hello');
        tokens[0].index.should.equal(0);
        tokens[0].offset.should.equal(5);

        tokens[1].value.should.equal(' ');
        tokens[1].index.should.equal(5);
        tokens[1].offset.should.equal(1);

        tokens[2].value.should.equal('world');
        tokens[2].index.should.equal(6);
        tokens[2].offset.should.equal(5);
    });

    it('should accept option to split instead of extracting (2)', function() {
        var extract = tokenize.re(/\s/i, { split: true });
        var tokens = extract('hello world\ntest');

        tokens.should.have.lengthOf(5);
        tokens[0].value.should.equal('hello');
        tokens[1].value.should.equal(' ');
        tokens[2].value.should.equal('world');
        tokens[3].value.should.equal('\n');
        tokens[4].value.should.equal('test');
    });
});

