/* globals describe it */

require("should");
const RawSource = require("webpack-sources").RawSource;
const BabelPlugin = require("../index");

const testFixtures = {
	"test1.js": new RawSource("const n = 1;")
};
const testExpected = {
	"test1.js": new RawSource('"use strict";\n\nvar n = 1;')
};

function test(options, fixtures, expected) {
	const compilation = {
		errors: [],
		assets: fixtures,
		additionalChunkAssets: [],
		testExpected() {
			Object.keys(fixtures).forEach((key) => {
				this.assets[key].source().should.be.equal(expected[key].source());
			}, this);
		},
		plugin(name, fn) {
			if (name === "optimize-chunk-assets") {
				// Pass dummy chunks
				fn([{ files: Object.keys(fixtures) }], () => {
					compilation.testExpected();
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

	const plugin = new BabelPlugin(options);
	plugin.apply(compiler);
}

describe("babel-webpack-plugin", () => {
	it("should run babel on chunk files", () => {
		test({}, testFixtures, testExpected);
	});
});
