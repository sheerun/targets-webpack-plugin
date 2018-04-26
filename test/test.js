/* globals describe it */

require("should");
const RawSource = require("webpack-sources").RawSource;
const TargetsPlugin = require("../index");

const testFixtures = {
	"test1.js": new RawSource("const n = Object.assign({ foo: 'bar' }); [].includes(12)")
};
const testExpected = {
	"test1.js": new RawSource('"use strict";\n\nvar n = 1;')
};

function test(options, fixtures, expected, done) {
	const compilation = {
		errors: [],
		assets: fixtures,
		additionalChunkAssets: [],
		testExpected() {
			Object.keys(fixtures).forEach((key) => {
        console.log(this.assets[key].source())
        if (this.assets[key].source().indexOf('$export$1') === -1) {
          throw this.assets[key].source()
        }
			}, this);
		},
		plugin(name, fn) {
			if (name === "optimize-chunk-assets") {
				// Pass dummy chunks
				fn([{ files: Object.keys(fixtures) }], () => {
          try {
            compilation.testExpected();
            done()
          } catch (e) {
            done(e)
          }
				});
			}
		}
	};
	const compiler = {
		context: "./",
		plugin(name, fn) {
			if (name === "compilation") {
        fn(compilation);
			}
		}
	};

	const plugin = new TargetsPlugin(options);
	plugin.apply(compiler);
}

describe("babel-webpack-plugin", () => {
	it("should run babel on chunk files", (done) => {
		test({}, testFixtures, testExpected, done);
	});
});
