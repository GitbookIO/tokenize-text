var _ = require("lodash");

var tokenUtils = require('./tokens');

var WORD_BOUNDARY_CHARS = '\t\r\n\u00A0 !\"#$%&()*+,\-.\\/:;<=>?@\[\\\]^_`{|}~';
var WORD_BOUNDARY_REGEX = new RegExp('[' + WORD_BOUNDARY_CHARS + ']');
var SPLIT_REGEX = new RegExp(
    '([^' + WORD_BOUNDARY_CHARS + ']+)');

function Tokenizer(opts) {
    if (!(this instanceof Tokenizer)) return (new Tokenizer(opts));

    this.opts = _.defaults(opts || {}, {
        cacheGet: function(key) { return null; },
        cacheSet: function(key, value) { }
    });

    _.bindAll(this);
}


// Tokenize a text using a transformative function
Tokenizer.prototype.split = function tokenizeSplit(fn, opts) {
    var that = this;

    opts = _.defaults(opts || {}, {
        cache: _.constant(null)
    });

    return function(text) {
        var prev = undefined;
        var cacheId, cacheValue;

        // if string, convert to one large token
        if (_.isString(text)) {
            text = [
                {
                    value: text,
                    index: 0,
                    offset: text.length
                }
            ];
        }

        cacheId = tokenUtils.tokensId(text, opts.cache());
        if (cacheId) {
            cacheValue = that.opts.cacheGet(cacheId);
            if (cacheValue) {
                return cacheValue;
            }
        }

        return _.chain(text)
            .map(function(token, i) {
                var next = text[i + 1];
                var tokens = fn(
                    // Current text value
                    token.value,

                    // Current complete token
                    _.clone(token),

                    // Previous token
                    prev? _.clone(prev) : null,

                    // Next token
                    next? _.clone(next) : null,

                    // Index in the tokens list
                    i,

                    // List of all tokens
                    text
                ) || [];

                // Normalize tokens and return
                tokens = tokenUtils.normalize(token, tokens);

                // Update reference to prev
                prev = token;

                return tokens;
            })
            .compact()
            .flatten()
            .tap(function(_tokens) {
                if (!cacheId) return;

                that.opts.cacheSet(cacheId, _tokens);
            })
            .value();
    };
};

// Debug a tokenizing flow
Tokenizer.prototype.debug = function tokenizeDebug() {
    return this.filter(function(text, tok) {
        console.log('[' + tok.index + '-' + (tok.index + tok.offset) + ']', tok.value);
        return true;
    });
};


// Tokenize a text using a RegExp
Tokenizer.prototype.re = function tokenizeRe(re, opts) {
    opts = _.defaults(opts || {}, {
        split: false
    });

    return this.split(function(text) {
        var originalText = text;
        var tokens = [];
        var match;
        var start = 0;
        var lastIndex = 0;

        while (match = re.exec(text)) {
            // Index in the current text section
            var index = match.index;

            // Index in the original text
            var absoluteIndex = start + index;

            var value = match[0] || "";
            var offset = value.length;

            // If splitting, push missed text
            if (opts.split && start < absoluteIndex) {
                var beforeText = originalText.slice(start, absoluteIndex);
                tokens.push({
                    value: beforeText,
                    index: start,
                    offset: beforeText.length
                });
            }

            tokens.push({
                value: value,
                index: absoluteIndex,
                offset: offset,
                match: match
            });

            text = text.slice(index + offset);
            start = absoluteIndex + offset;
        }

        // If splitting, push left text
        if (opts.split && text) {
            tokens.push({
                value: text,
                index: start,
                offset: text.length
            });
        }

        return tokens;
    }, {
        cache: function() {
            return re.toString();
        }
    });
};

// Split and merge tokens
// Used to split as sentences even if sentences is separated in multiple tokens (ex: markup)
// if fn results contain a 'null', it will split in two tokens
Tokenizer.prototype.splitAndMerge = function tokenizeSplitAndMerge(fn, opts) {
    var that = this;

    opts = _.defaults(opts || {}, {
        mergeWith: ''
    });

    return function(tokens) {
        var result = [];
        var accu = [];

        function pushAccu() {
            if (accu.length == 0) return;

            // Merge accumulator into one token
            var tok = tokenUtils.merge(accu, opts.mergeWith);

            result.push(tok);
            accu = [];
        }

        that.split(function(word, token) {
            var toks = fn.apply(null, arguments);

            // Normalize tokens
            toks = tokenUtils.normalize(token, toks);

            // Accumulate tokens and push to final results
            _.each(toks, function(tok) {
                if (!tok) {
                    pushAccu();
                } else {
                    accu.push(tok);
                }
            });
        })(tokens);

        // Push tokens left in accumulator
        pushAccu();

        return result;
    };
};

// Filter when tokenising
Tokenizer.prototype.filter = function tokenizeFilter(fn) {
    return this.split(function(text, tok) {
        if (fn.apply(null, arguments)) {
            return tok.value;
        }
        return undefined;
    });
};

// Filter by testing a regex
Tokenizer.prototype.test = function tokenizeTest(re) {
    return this.filter(function(text, tok) {
        return re.test(text);
    }, {
        cache: re.toString()
    });
};

// Group and process a token as a group
Tokenizer.prototype.flow = function tokenizeFlow() {
    var fn = _.flow.apply(_, arguments);
    return this.split(fn);
};


// Merge all tokens into one
Tokenizer.prototype.merge = _.partial(Tokenizer.prototype.splitAndMerge, _.identity);


Tokenizer.prototype.sections = _.partial(Tokenizer.prototype.re, /([^\n\.,;!?]+)/i, { split: false });
Tokenizer.prototype.words = _.partial(Tokenizer.prototype.re, SPLIT_REGEX);
Tokenizer.prototype.characters = _.partial(Tokenizer.prototype.re, /[^\s]/);

module.exports = Tokenizer;
