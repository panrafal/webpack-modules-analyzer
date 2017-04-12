#!/usr/bin/env node

var args = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var util = require('util')
var analyse = require('./lib/analyse')
var toJSON = require('./lib/toJSON')
var toCSV = require('./lib/toCSV')

var statsFile = args._[0]

if (!statsFile || args.help || !(args.json || args.csv || args.inspect)) {
  help = [
    'Webpack Stats file analyzer',
    '\nUsage:',
    '  webpack-modules-analyzer  [other options] build-stats.json',
    '\nOutput options: ',
    '  --inspect - print out results to console',
    '  --json=FILE - print out results to json file',
    '  --csv=FILE - print out results to csv file',
    '  --verbose - include all dependent modules in output',
    '  --sortBy=KEY - sort by specified key (defaults to allSize)',
    '\nAnalysis: ',
    '  --gzip - count gzipped module size',
    '  --limit=X - limit results to top X item',
    '  --match=REGEXP - limit results to modules with name matching REGEXP',
    '  --chunk=CHUNK - limit results to modules in CHUNK',
    '  --summarize - summarize results',
    '  --source - include source',
  ]
  console.log(help.join('\n'))
  return
}

var stats = JSON.parse(fs.readFileSync(statsFile))
var options = args

var result = analyse(stats, options)
// console.log(util.inspect(result, {colors: true, depth: 2}))

var json = toJSON(result, options)

if (args.json) {
  fs.writeFileSync(args.json, JSON.stringify(json))
}
if (args.csv) {
  toCSV(json, fs.createWriteStream(args.csv))
}

if (args.inspect) {
  console.log(util.inspect(json, {colors: true, depth: 4}))
}
