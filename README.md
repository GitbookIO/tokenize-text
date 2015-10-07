# tokenize-text

Javascript text tokenizer that is easy to use and compose.

### Installation

```
$ npm install tokenize-text
```

### Usage

```js
var tokenize = require('tokenize-text');
```

##### tokenize(fn)


##### tokenize.re(re)

##### tokenize.characters()

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

##### tokenize.sections()

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

##### tokenize.words()




##### tokenize.filter(fn)

Filter the list of tokens by calling `fn(token)`:

```js
var extractNames = tokenize.filter(function(word, current, prev) {
    return (prev && /[A-Z]/.test(word[0]));
});

var words = tokenize.words()('My name is Samy.');
var tokens = extractNames(words);

/*
[
    { value: 'Samy', index: 11, offset: 4 }
]
*/
```

##### tokenize.flow(fn1, fn2, [...])

Creates a tokenizer that returns the result of invoking the provided tokenizers in serie.

```js
var extractNames = tokenize.flow(
    tokenize.words(),
    tokenize.filter(function(word, current, prev) {
        return (prev && /[A-Z]/.test(word[0]));
    })
);

var tokens = extractNames('My name is Samy.');
```

### Examples

##### Extract repeated words in sentences

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


