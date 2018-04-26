const path = require('path')
const fs = require('fs')
const OriginalSource = require('webpack-sources').OriginalSource
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers')
const babel = require('@babel/core')
const rollup = require('rollup')
const commonJs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const hypothetical = require('rollup-plugin-hypothetical')

async function optimizeChunks (options, compilation, chunks) {
  let files = []
  chunks.forEach(chunk => files.push(...chunk.files))
  files.push(...compilation.additionalChunkAssets)
  files = files.filter(
    ModuleFilenameHelpers.matchObject.bind(undefined, options)
  )
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const asset = compilation.assets[file]
      if (asset.__BabelPlugin) {
        compilation.assets[file] = asset.__BabelPlugin
        return
      }

      let input
      let inputSourceMap
      const browsers = options.browsers || ['last 2 versions', 'chrome >= 41']
      const fileOptions = {
        presets: [
          [
            require.resolve('@babel/preset-env'),
            {
              targets: { browsers },
              useBuiltIns: 'usage',
              modules: false,
              exclude: ['transform-typeof-symbol']
            }
          ]
        ],
        compact: true,
        babelrc: false
      }

      input = asset.source()

      const result = babel.transform(input, fileOptions)

      let map

      const source = result.code

      const bundle = await rollup.rollup({
        input: './input.js',
        plugins: [
          nodeResolve({
            jsnext: true,
            main: true
          }),
          commonJs({
            include: ['node_modules/**']
          }),
          hypothetical({
            files: {
              './input.js': source
            },
            allowFallthrough: true
          })
        ]
      })

      const result2 = await bundle.generate({
        format: 'iife',
        moduleName: 'App',
        indent: false
      })

      compilation.assets[file] = new OriginalSource(result2.code, file)

      compilation.assets[file].__BabelPlugin = compilation.assets[file]
    } catch (err) {
      if (err.line) {
        compilation.errors.push(
          new Error(
            file +
              ' from Babel\n' +
              err.message +
              ' [' +
              file +
              ':' +
              err.line +
              ',' +
              err.col +
              ']'
          )
        )
      } else if (err.msg) {
        compilation.errors.push(new Error(file + ' from Babel\n' + err.msg))
      } else {
        compilation.errors.push(new Error(file + ' from Babel\n' + err.stack))
      }
    }
  }
}

class BabelPlugin {
  constructor (options) {
    if (typeof options !== 'object' || Array.isArray(options)) options = {}
    this.options = options
  }

  apply (compiler) {
    const options = this.options

    options.test = options.test || /\.js($|\?)/i
    compiler.plugin('compilation', compilation => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        optimizeChunks(options, compilation, chunks)
          .then(
            function () {
              callback()
            },
            function (err) {
              throw err
              callback()
            }
          )
          .catch(function (e) {
            throw e
          })
      })
    })
  }
}

module.exports = BabelPlugin
