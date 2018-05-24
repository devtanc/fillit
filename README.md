# Fillit

The fillit library allows you to create template files, read them into a class, and replace keys throughout the file by specifying key-value pairs to replace.

![npm (scoped)](https://img.shields.io/npm/v/@devtanc/fillit.svg)
![CircleCI](https://img.shields.io/circleci/project/github/devtanc/fillit.svg)
![GitHub issues](https://img.shields.io/github/issues/devtanc/fillit.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

## Installation

```js
npm i -S @devtanc/fillit
// or
yarn add @devtanc/fillit
```

## Usage

> folder contents

```
index.js
email.template.txt
```

> email.template.txt

```
Hey there @recipientName,

This is @senderFirstName. Just shooting you a note to say @message.

@salutation,

@senderFirstName @senderLastName
```

> index.js

```js
const Template = require('@devtanc/fillit')
const path = require('path')

const emailTemplate = new Template({ path: path.resolve(__dirname, 'email.template.txt') })

emailTemplate.addPair('recipientName', 'Karl')
emailTemplate.addPair('senderFirstName', 'François')
emailTemplate.addPair('senderLastName', 'Lionet')
emailTemplate.addPair('message', 'I hope you\'re doing @howWell well')
emailTemplate.addPair('salutation', 'Hope to hear from you soon')
emailTemplate.addPair('howWell', 'fantastically')
emailTemplate.addPair(/shooting/, 'sending')


const result = emailTemplate.fill()
```

> result

```
Hey there Karl,

This is François. Just sending you a note to say I hope you're doing fantastically well.

Hope to hear from you soon,

François Lionet
```

## API

```js
getPairs()
// Returns current Map of <key,value> pairs

getResult()
// Returns the current result of the template
// fill() will typically be called before this
// if not, then this will return the same result as getTemplate()

getTemplate()
// Returns the raw template source

getKeyPattern()
// Returns the currently set key pattern string

addPair(key, value)
addPair([key, value])
// Takes either input. Adds the given <key, value> pair to the internal Map

addPairs(Map)
// Takes in a Map and adds all entries to the internal Map

setKeyPattern(string)
// Takes in a key pattern. This string MUST contain the string 'key' at least once
// Key patterns represent a key that is surrounded by one or more other characters
// on fill(), the 'key' is first replaced with the key from the current Map item
// then the resulting string is used to find the locations in the template to place the value
// given:
// keyPattern = '!@#key&*()'
// keyvalue = ['thisismykey', 'theassociatedvalue']
//
// First: keyPattern becomes '!@#thisismykey&*()'
// Then anywhere in the template where that key is found is replaced with 'theassociatedvalue'
// The default key pattern is '@key'

fill()
fill(Map)
// Executes the filling of the template and returns the result of the fill
// If a Map is provided, then the <key,value> pairs in the Map are ADDED to the internal Map
// before the execution of the replacements

reset()
// Simply resets the current template result back to the initial template value
```

## Important things to note

The result is modified and stored after each full `<key, value>` replacement is complete. This makes is so that nested replacements are possible, as shown in the email example where `@howWell` was found in a previous replacement, but not in the original template.

It is valid to set a RegExp as a key, which is also in the example. The RegExp is used in place of the key pattern for that round of `<key,value>` replacement. The `g` flag is set internally.
