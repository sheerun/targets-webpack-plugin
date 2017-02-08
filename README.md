# babel-webpack-plugin [![npm](https://img.shields.io/npm/v/babel-webpack-plugin.svg)](https://www.npmjs.com/package/babel-webpack-plugin) [![Build Status](https://travis-ci.org/simlrh/babel-webpack-plugin.svg?branch=master)](https://travis-ci.org/simlrh/babel-webpack-plugin) [![Donate](https://nourish.je/assets/images/donate.svg)](http://ko-fi.com/A250KJT)

>Babel is a compiler for writing next generation JavaScript.

A babel plugin (not a loader) for webpack.

Webpack 2 can handle native ES2015 modules, so there's no need to run babel's `es2015` preset on every module before passing it to webpack. Doing so just adds to compile time. In addition, as loaders are updated to return ES2015, you would need to add a babel-loader to the top of the chain for every single filetype.

This plugin runs babel only once per asset, at the end of the compilation process.

## Installation

   npm install babel-webpack-plugin

## Usage

Add BabelPlugin to the list of plugins. 

```js
var BabelPlugin = require("babel-webpack-plugin");

plugins: [
	new BabelPlugin({
		test: /\.js$/,
		presets: ['es2015'],
		sourceMaps: false,
		compact: false
	})
]
```

## Options

The options above are the default, see all options for `babel` [here](http://babeljs.io/docs/usage/options/).
