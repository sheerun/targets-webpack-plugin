# targets-webpack-plugin [![npm](https://img.shields.io/npm/v/targets-webpack-plugin.svg)](https://www.npmjs.com/package/targets-webpack-plugin)

A babel plugin for transcompiling final bundles so they support legacy browsers.

This plugin runs babel and rollup only once per asset, at the end of the compilation process.

## Installation

```
npm install --save-dev targets-webpack-plugin
```

or

```
yarn add --dev targets-webpack-plugin
```

## Usage

Add TargetsPlugin to the list of plugins.

```js
// next.config.js
const TargetsPlugin = require("targets-webpack-plugin");

module.exports = {
  webpack: function (config, { dev }) {
    if (!dev) {
      config.plugins.push(new TargetsPlugin({
        browsers: ["last 2 versions", "chrome >= 41"]
      }))
    }
    return config
  }
}
```

## License

MIT
