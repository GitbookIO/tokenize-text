var tokenize = require("./instance");

describe('tokenize.filter()', function() {
    it('should correctly pass prev token', function() {
        var extractName = tokenize.filter(function(word, current, prev) {
            return (prev && /[A-Z]/.test(word[0]));
        });

        var words = tokenize.words()('My name is Samy.');
        var tokens = extractName(words);

        tokens.should.have.lengthOf(1);
        tokens[0].value.should.equal('Samy');
        tokens[0].index.should.equal(11);
        tokens[0].offset.should.equal(4);
    });
});

