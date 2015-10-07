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

##### Tokenize as characters

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

##### Compose tokenizers

`tokenize.flow(fn1, fn2, ...)` is being used to compose multiple tokenizers.

Example to extract all repeated words in sentences:

```js
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

/*
[
    { value: 'great', index: 14, offset: 5 },
    { value: 'an', index: 33, offset: 2 }
]
*/
```


