# targets-webpack-plugin [![npm](https://img.shields.io/npm/v/targets-webpack-plugin.svg)](https://www.npmjs.com/package/targets-webpack-plugin)

A babel plugin for transcompilig final bundles so they support legacy browsers.

This plugin runs babel and rollup only once per asset, at the end of the compilation process.

## Installation

   npm install targets-webpack-plugin

## Usage

Add TargetsPlugin to the list of plugins.

```js
var TargetsPlugin = require("targets-webpack-plugin");

plugins: [
	new TargetsPlugin({
		test: /\.js$/,
    browsers: ["last 2 versions", "chrome >= 41"]
	})
]
```

## License

MIT
