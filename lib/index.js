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
        preserveProperties: true,
        cache: _.constant(null)
    });

    return function(text, tok) {
        // If called as a split function, directly call fn
        if (arguments.length == 6) return fn.apply(null, arguments);

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
        } else if (!_.isArray(text)) {
            text = [text];
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

                // Preserve properties
                if (opts.preserveProperties) {
                    var props = tokenUtils.properties(token);
                    tokens = _.map(tokens, function(_tok) {
                        return _.defaults(_tok, props);
                    });
                }

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
Tokenizer.prototype.debug = function tokenizeDebug(prefix) {
    return this.filter(function(text, tok) {
        var props = tokenUtils.properties(tok);

        console.log(
            prefix || '',
            '[' + tok.index + '-' + (tok.index + tok.offset) + ']',
            JSON.stringify(tok.value),
            _.size(props)? JSON.stringify(props) : ''
        );
        return true;
    });
};


// Tokenize a text using a RegExp
Tokenizer.prototype.re = function tokenizeRe(re, opts) {
    opts = _.defaults(opts || {}, {
        split: false
    });

    return this.split(function(text, tok) {
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
                if (tok === null) {
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
            return {
                value: tok.value,
                index: 0,
                offset: tok.offset
            };
        }
        return undefined;
    });
};

// Extend a token properties
Tokenizer.prototype.extend = function tokenizeExtend(fn) {
    return this.split(function(text, tok) {
        var o = _.isFunction(fn)? fn.apply(null, arguments) : fn;

        return _.extend({
            value: tok.value,
            index: 0,
            offset: tok.offset
        }, o);
    });
};

// Condition for tokenizing flow
// "fns" will be called if condition passed
Tokenizer.prototype.ifthen = function(condition, then) {
    //var fns = _.toArray(arguments).slice(1);
    //var flow = this.flow.apply(this, fns);

    return this.split(function(text, tok) {
        if (condition.apply(null, arguments)) {
            return then.apply(null, arguments);
        }

        return _.omit(tok, 'index');
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

// Process token by all arguments
Tokenizer.prototype.flow = function tokenizeFlow() {
    var fn = _.flow.apply(_, arguments);
    return this.split(fn);
};

// Group and process a token as a group
Tokenizer.prototype.serie = function tokenizeFlow() {
    var fn = _.flow.apply(_, arguments);
    return fn;
};


// Merge all tokens into one
Tokenizer.prototype.merge = _.partial(Tokenizer.prototype.splitAndMerge, _.identity);


Tokenizer.prototype.sections = _.partial(Tokenizer.prototype.re, /([^\n\.,;!?]+)/i, { split: false });
Tokenizer.prototype.words = _.partial(Tokenizer.prototype.re, SPLIT_REGEX);
Tokenizer.prototype.characters = _.partial(Tokenizer.prototype.re, /[^\s]/);

module.exports = Tokenizer;
