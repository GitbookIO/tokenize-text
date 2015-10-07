var tokenize = require("./instance");

describe('tokenize.splitAndMerge(fn)', function() {
    it('should merge according to a criteria', function() {
        var tokens = tokenize.flow(
            tokenize.characters(),
            tokenize.splitAndMerge(function(tok) {
                if (tok == '.') return [tok, null];
                return tok;
            })
        )('ab.c');

        tokens.should.have.lengthOf(2);
        tokens[0].value.should.equal('ab.');
        tokens[0].index.should.equal(0);
        tokens[0].offset.should.equal(3);

        tokens[1].value.should.equal('c');
        tokens[1].index.should.equal(3);
        tokens[1].offset.should.equal(1);
    });

    it('should handle disperse tokens', function() {
        var tokens = tokenize.flow(
            tokenize.re(/\S+/),
            tokenize.splitAndMerge(function(tok) {
                if (tok == '|') return null;
                return tok;
            }, {
                mergeWith: ' '
            })
        )('ab cd | ef gh');

        tokens.should.have.lengthOf(2);

        tokens[0].value.should.equal('ab cd');
        tokens[0].index.should.equal(0);
        tokens[0].offset.should.equal(5);

        tokens[1].value.should.equal('ef gh');
        tokens[1].index.should.equal(8);
        tokens[1].offset.should.equal(5);
    });
});

