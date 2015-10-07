var tokenUtils = require('../lib/tokens');

describe('Tokens Utilities', function() {
    describe('tokensUtils.normalize()', function() {
        it('should correctly normalize', function() {
            var tokens = tokenUtils.normalize({
                value: 'test hello',
                index: 5
            }, [
                {
                    value: 'test',
                    index: 0,
                    offset: 4
                },
                {
                    value: 'hello',
                    index: 5,
                    offset: 5
                }
            ]);

            tokens.should.have.lengthOf(2);
            tokens[0].value.should.equal('test');
            tokens[0].index.should.equal(5);

            tokens[1].value.should.equal('hello');
            tokens[1].index.should.equal(10);
        });

        it('should correctly ignore nulls', function() {
            var tokens = tokenUtils.normalize({
                value: 'test hello',
                index: 5
            }, [
                {
                    value: 'test',
                    index: 0,
                    offset: 4
                },
                null,
                {
                    value: 'hello',
                    index: 5,
                    offset: 5
                }
            ]);

            tokens.should.have.lengthOf(3);
            tokens[0].value.should.equal('test');
            tokens[0].index.should.equal(5);

            tokens[2].value.should.equal('hello');
            tokens[2].index.should.equal(10);
        });

        it('should handle texts and ignore nulls', function() {
            var tokens = tokenUtils.normalize({
                value: 'Barney.The',
                index: 6,
                offset: 10
            }, [ 'Barney', null, 'The' ]);

            tokens.should.have.lengthOf(3);
            tokens[0].value.should.equal('Barney');
            tokens[0].index.should.equal(6);
            tokens[2].value.should.equal('The');
            tokens[2].index.should.equal(12);
        });
    });
});

