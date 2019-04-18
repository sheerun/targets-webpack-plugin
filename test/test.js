/* globals describe it */

require("should");
const RawSource = require("webpack-sources").RawSource;
const TargetsPlugin = require("../index");

const testFixtures = {
  "test2.js": new RawSource(
    "const n = Object.assign({ foo: 'bar' }); n.includes(12)"
  )
};
const testExpected = {
  "test2.js": /var n=Object.assign\({foo:'bar'}\);n.includes\(12\);/
};

function test(options, fixtures, expected, done) {
  const compilation = {
    errors: [],
    assets: fixtures,
    additionalChunkAssets: [],
    testExpected() {
      if (compilation.errors.length > 0) {
        throw compilation.errors[0];
      }
      Object.keys(fixtures).forEach(key => {
        if (!this.assets[key].source().match(expected[key])) {
          throw new Error(
            "\nExpected:" +
              expected[key] +
              "\nResult:\n" +
              this.assets[key].source()
          );
        }
      }, this);
    },
    hooks: {
      buildModule: {
        tap: function(name, fn) {
          fn({ module: { useSourceMap: false } });
        }
      },
      optimizeChunkAssets: {
        tapPromise: function(name, fn) {
          if (name === "targets-optimize-chunk-assets") {
            // Pass dummy chunks
            fn([{ files: Object.keys(fixtures) }]).then(
              () => {
                try {
                  compilation.testExpected();
                  done();
                } catch (e) {
                  done(e);
                }
              },
              function(e) {
                done(e);
              }
            );
          }
        }
      }
    }
  };
  const compiler = {
    context: "./",
    hooks: {
      compilation: {
        tap: function(name, fn) {
          if (name === "targets-compilation") {
            fn(compilation);
          }
        }
      }
    }
  };

  const plugin = new TargetsPlugin(options);
  plugin.apply(compiler);
}

describe("babel-webpack-plugin", () => {
  it("should run babel on chunk files", done => {
    test({}, testFixtures, testExpected, done);
  });
});
