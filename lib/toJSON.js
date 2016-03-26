const _ = require('lodash')

function dependencySizes(dependencies) {
  dependencies = _.orderBy(dependencies, 'size', 'desc')
  return _.transform(dependencies, function(result, module) {
    result[module.name] = module.size
  }, {})
}

module.exports = function toJSON(analysis, options) {
  const result = {}
  result.modules = _.orderBy(analysis.modules, 'allSize', 'desc')
  if (options.limit) result.modules = result.modules.slice(0, options.limit)
  if (options.match) {
    const re = new RegExp(options.match, 'i')
    result.modules = _.filter(result.modules, function(m) {
      return re.test(m.name)
    })
  }
  result.modules = _.map(result.modules, function(m) {
    const module = _.clone(m)
    module.reasons = _.map(module.reasons, 'name').sort()
    if (options.verbose) {
      module.dependencies = _.map(module.dependencies, 'name').sort()
      module.retainedDependencies = dependencySizes(module.retainedDependencies)
      module.sharedDependencies = dependencySizes(module.sharedDependencies)
    } else {
      delete module.dependencies
      delete module.retainedDependencies
      delete module.sharedDependencies
    }
    delete module.allDependencies
    return module
  })
  return result
}
