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

    it('should not change valeu of index and offset', function() {
        var tokens = [
            { value: 'test', index: 10, offset: 10 },
            { value: 'test 2', index: 30, offset: 20}
        ];

        var filter = tokenize.filter(function() {
            return true;
        });

        tokens = filter(tokens);
        tokens.should.have.lengthOf(2);
        tokens[0].index.should.equal(10);
        tokens[0].offset.should.equal(10);
        tokens[1].index.should.equal(30);
        tokens[1].offset.should.equal(20);
    })
});

