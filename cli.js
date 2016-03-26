#!/usr/bin/env node

var args = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var util = require('util')
var analyse = require('./lib/analyse')
var toJSON = require('./lib/toJSON')
var toCSV = require('./lib/toCSV')

var statsFile = args._[0]
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
