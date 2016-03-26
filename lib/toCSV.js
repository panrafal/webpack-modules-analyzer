const csvStringify = require('csv-stringify')
const _ = require('lodash')

module.exports = function toCSV(json, stream) {
  const delimiter = '\t'
  const csv = csvStringify({
    delimiter: delimiter,
    header: true,
    columns: {
      id: 'ID',
      identifier: 'identifier',
      name: 'name',

      size: 'size',
      retainedSize: 'retainedSize',
      sharedSize: 'sharedSize',
      allSize: 'allSize',

      reasonCount: 'reasonCount',
      directCount: 'directCount',
      retainedCount: 'retainedCount',
      sharedCount: 'sharedCount',
      allCount: 'allCount',

      duplicate: 'duplicate',
      cacheable: 'cacheable',

      chunks: 'chunks',
      assets: 'assets',

      reasons: 'reasons',
      dependencies: 'dependencies',
      retainedDependencies: 'retainedDependencies',
      sharedDependencies: 'sharedDependencies',
    }
  })
  csv.pipe(stream)
  _.forEach(json.modules, function(module) {
    const row = _.mapValues(module, function(value, key) {
      if (_.isArray(value)) return value.join(', ').substr(0, 1000)
      if (_.isObject(value)) {
        return _.map(value, function(v, k) {
          return k + ': ' + v
        }).join(', ').substr(0, 1000)
      }
      return String(value)
    })
    csv.write(row)
  })
  csv.end()
}
