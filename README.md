# tokenize-text

[![Build Status](https://travis-ci.org/GitbookIO/tokenize-text.png?branch=master)](https://travis-ci.org/GitbookIO/tokenize-text)
[![NPM version](https://badge.fury.io/js/tokenize-text.svg)](http://badge.fury.io/js/tokenize-text)

Javascript text tokenizer that is easy to use and compose.

### Installation

```
$ npm install tokenize-text
```

### Usage

```js
var tokenize = require('tokenize-text');
```

#### tokenize(fn)

This is the main method of this module, all other methods are using it.

`fn` will be called with 4 arguments:

- `text`: text value of the token (`text == currentToken.value`)
- `currentToken`: current token object
- `prevToken`: precedent token (or null)
- `nextToken`: next token (or null)

`fn` should return a string, an array of string, a token or an array of tokens.

`tokenize(fn)` returns a tokenizer function that accept a list of tokens or a string argument (it will be convert as one token).

The tokenizer function returns an array of tokens with the following properties:

- `value`: text content of the token
- `index`: absolute position in the original text
- `offset`: length of the token (equivalent to `value.length`)

```js
// Simple tokenizer that split into 2 sections
var splitIn2 = tokenize(function(text, currentToken, prevToken, nextToken) {
    return [
        text.slice(0, text.length / 2),
        text.slice(text.length / 2)
    ]
});

var tokens = splitIn2('hello');

/*
[
    { value: 'he', index: 0, offset: 2 },
    { value: 'llo', index: 2, offset: 3 }
]
*/
```

#### tokenize.re(re)

Tokenize using a regular expression:

```js
var extractUppercase = tokenize.re(/[A-Z]/);
var tokens = extractUppercase('aBcD');

/*
[
    { value: 'B', index: 1, offset: 1 },
    { value: 'D', index: 3, offset: 1 }
]
*/
```

#### tokenize.characters()

Tokenize and split as characters, `tokenize.characters()` is equivalent to `tokenize.re(/[^\s]/)`.

```js
var tokens = tokenize.characters()('abc');

/*
[
    { value: 'a', index: 0, offset: 1 },
    { value: 'b', index: 1, offset: 1 },
    { value: 'c', index: 2, offset: 1 }
]
*/
```

#### tokenize.sections()

Split in sections, sections are split by `\n . , ; ! ?`.

```js
var tokens = tokenize.sections()('this is sentence 1. this is sentence 2');

/*
[
    {
        value: 'this is sentence 1',
        index: 0,
        offset: 18
    },
    {
        value: ' this is sentence 2',
        index: 19,
        offset: 19
    }
]
*/
```

#### tokenize.words()




#### tokenize.filter(fn)

Filter the list of tokens by calling `fn(token)`:

```js
// Filter the words to extract the ones that start with an uppercase
var extractNames = tokenize.filter(function(word, current, prev) {
    return (prev && /[A-Z]/.test(word[0]));
});

// Split texts in words
var words = tokenize.words()('My name is Samy.');

// Apply the filter
var tokens = extractNames(words);

/*
[
    { value: 'Samy', index: 11, offset: 4 }
]
*/
```

#### tokenize.flow(fn1, fn2, [...])

Creates a tokenizer that returns the result of invoking the provided tokenizers in serie.

```js
var extractNames = tokenize.flow(
    // Split text as words
    tokenize.words(),

    // Filter the words to extract the ones that start with an uppercase
    tokenize.filter(function(word, current, prev) {
        return (prev && /[A-Z]/.test(word[0]));
    })
);

var tokens = extractNames('My name is Samy.');
```

### Examples

#### Extract repeated words in sentences

Example to extract all repeated words in sentences:

```js
var repeatedWords = tokenize.flow(
    // Tokenize as sections
    tokenize.sections(),

    // For each sentence
    tokenize.flow(
        // Tokenize as words
        tokenize.words(),

        // Filter words to extract only repeated ones
        tokenize.filter(function(word, token, prev) {
            return (
                prev &&
                token.value.toLowerCase() === prev.value.toLowerCase()
            );
        })
    )
);


var tokens = repeatedWords('This is great great. Great is an an awesome words');

/*
[
    { value: 'great', index: 14, offset: 5 },
    { value: 'an', index: 33, offset: 2 }
]
*/
```


