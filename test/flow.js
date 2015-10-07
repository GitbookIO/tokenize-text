var tokenize = require("./instance");

describe('tokenize.flow()', function() {

    it('ex: repeated words', function() {
        var repeatedWords = tokenize.flow(
            // Tokenize as sections
            tokenize.sections(),

            // For each sentence
            tokenize.flow(
                // Tokenize as words
                tokenize.words(),

                // For each sentences
                tokenize.filter(function(word, token, prev) {
                    return (
                        prev &&
                        token.value.toLowerCase() === prev.value.toLowerCase()
                    );
                })
            )
        );


        var tokens = repeatedWords('This is great great. Great is an an awesome words');
        tokens.should.have.lengthOf(2);

        tokens[0].value.should.equal('great');
        tokens[0].index.should.equal(14);
        tokens[0].offset.should.equal(5);

        tokens[1].value.should.equal('an');
        tokens[1].index.should.equal(33);
        tokens[1].offset.should.equal(2);
    });
});

