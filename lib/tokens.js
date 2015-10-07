var _ = require("lodash");

/*
Token is an object like:

{
    "value": "text content",

    // Position of the index
    "index": 0,

    // Length of the token
    "offset": "text content".length
}
*/

// Return a string ID to represent a list of tokens
function tokensId(tokens, prepend) {
    if (!prepend) return null;

    return _.reduce(tokens, function(prev, token) {
        var tokId = [
            token.index,
            token.offset,
            token.value
        ].join('-');

        return [prev, tokId].join(':');
    }, prepend);
}


// Normalize and resolve a list of tokens relative to a token
function normalizeTokens(relative, tokens) {
    var _index = 0;

    // Force as an array
    if (!_.isArray(tokens)) tokens = [tokens];

    return _.map(tokens, function(subtoken) {
        if (_.isString(subtoken)) {
            subtoken = {
                value: subtoken,
                index: _index,
                offset: subtoken.length
            };
        }

        if (_.isObject(subtoken)) {
            // Transform as an absolute token
            subtoken.index = relative.index + (subtoken.index || 0);
            subtoken.offset = subtoken.offset || subtoken.value.length;

            _index = _index + subtoken.index + subtoken.offset;
        }

        return subtoken;
    });
}

// Merge tokens
function mergeTokens(tokens, mergeWith) {
    if (tokens.length == 0) return null;

    var value = '';

    _.each(tokens, function(token, i) {
        var prev = tokens[i - 1];
        var next = tokens[i + 1];

        var toFill = prev? (token.index + 1 - (prev.index + prev.offset)): 0;
        value = value + new Array(toFill).join(mergeWith) + token.value;
    });

    return {
        // Index equal is the one from the first token
        index: _.first(tokens).index,

        value: value,
        offset: value.length
    }
}

module.exports = {
    tokensId: tokensId,
    normalize: normalizeTokens,
    merge: mergeTokens
};
