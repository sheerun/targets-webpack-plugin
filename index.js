const SourceMapSource = require("webpack-sources").SourceMapSource;
const OriginalSource = require("webpack-sources").OriginalSource;
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");
const RequestShortener = require("webpack/lib/RequestShortener");
const babel = require("@babel/core");
const rollup = require("rollup");
const commonJs = require("@rollup/plugin-commonjs");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const hypothetical = require("rollup-plugin-hypothetical");

class TargetsPlugin {
  constructor(options) {
    if (typeof options !== "object" || Array.isArray(options)) options = {};
    if (typeof options.sourceMaps === "undefined") {
      options.sourceMaps = true;
    }
    if (typeof options.test === "undefined") {
      options.test = /\.js(\?.*)?$/i;
    }
    this.options = options;
  }

  apply(compiler) {
    const options = this.options;

    const requestShortener = new RequestShortener(compiler.context);
    compiler.hooks.compilation.tap("targets-compilation", compilation => {
      compilation.hooks.optimizeChunkAssets.tapPromise(
        "targets-optimize-chunk-assets",
        chunks => {
          let files = [];
          chunks.forEach(chunk => files.push(...chunk.files));
          files.push(...compilation.additionalChunkAssets);
          files = files.filter(
            ModuleFilenameHelpers.matchObject.bind(undefined, options)
          );
          return Promise.all(
            files.map(async file => {
              let sourceMap;
              try {
                const asset = compilation.assets[file];
                // if (asset.__TargetsPlugin) {
                //   compilation.assets[file] = asset.__TargetsPlugin;
                //   return;
                // }

                let input;
                let inputSourceMap;

                const browsers = options.browsers || [
                  "last 2 versions",
                  "chrome >= 41"
                ];
                const fileOptions = {
                  presets: [
                    [
                      require.resolve("@babel/preset-env"),
                      {
                        targets: { browsers },
                        useBuiltIns: "usage",
                        corejs: 3,
                        modules: false,
                        exclude: ["transform-typeof-symbol"]
                      }
                    ]
                  ],
                  retainLines: true,
                  compact: options.compact || true,
                  babelrc: false
                };

                if (options.sourceMaps) {
                  if (asset.sourceAndMap) {
                    const sourceAndMap = asset.sourceAndMap();
                    inputSourceMap = sourceAndMap.map;
                    input = sourceAndMap.source;
                  } else {
                    inputSourceMap = asset.map();
                    input = asset.source();
                  }
                  fileOptions.inputSourceMap = inputSourceMap;
                } else {
                  input = asset.source();
                }

                if (fileOptions.inputSourceMap === null) {
                  inputSourceMap = undefined;
                  delete fileOptions.inputSourceMap;
                }

                const result = babel.transform(input, fileOptions);
                const source = result.code;
                const map = result.map;

                const bundle = await rollup.rollup({
                  input: "./input.js",
                  plugins: [
                    nodeResolve({
                      mainFields: ["module", "main"]
                    }),
                    commonJs({
                      include: ["node_modules/**"]
                    }),
                    hypothetical({
                      files: {
                        "./input.js": options.sourceMaps
                          ? {
                              code: source,
                              map: inputSourceMap
                            }
                          : source
                      },
                      allowFallthrough: true
                    })
                  ]
                });

                const result2 = await bundle.generate({
                  format: "iife",
                  name: "App",
                  indent: false,
                  sourcemap: options.sourceMaps
                });

                const source2 = result2.output[0].code;
                const map2 = result2.output[0].map;

                compilation.assets[file] = options.sourceMaps
                  ? new SourceMapSource(source2, file, map2)
                  : new OriginalSource(source2, file);

                // compilation.assets[file].__TargetsPlugin =
                //   compilation.assets[file];
              } catch (err) {
                if (err.msg) {
                  compilation.errors.push(
                    new Error(file + " from Babel\n" + err.msg)
                  );
                } else {
                  compilation.errors.push(
                    new Error(file + " from Babel\n" + err.stack)
                  );
                }
              }
            })
          );
        }
      );
    });
  }
}

module.exports = TargetsPlugin;
