const _ = require('lodash')

function dependencySizes(dependencies) {
  dependencies = _.orderBy(dependencies, 'size', 'desc')
  return _.transform(dependencies, function(result, module) {
    result[module.name] = module.size
  }, {})
}

module.exports = function toJSON(analysis, options) {
  const result = {}
  result.modules = _.orderBy(analysis.modules, options.sortBy || 'allSize', 'desc')
  if (options.match) {
    const re = new RegExp(options.match, 'i')
    result.modules = _.filter(result.modules, function(m) {
      return re.test(m.name)
    })
  }
  if (options.chunk) {
    result.modules = _.filter(result.modules, function(m) {
      return _.some(m.chunks, {name: options.chunk})
    })
  }
  if (options.limit) result.modules = result.modules.slice(0, options.limit)
  result.modules = _.map(result.modules, function(m) {
    const module = _.clone(m)
    module.reasons = _.map(module.reasons, 'name').sort()
    module.chunks = _.map(module.chunks, 'name').sort()
    if (options.verbose) {
      module.dependencies = _.map(module.dependencies, 'name').sort()
      module.retainedDependencies = dependencySizes(module.retainedDependencies)
      module.asyncDependencies = dependencySizes(module.asyncDependencies)
      module.sharedDependencies = dependencySizes(module.sharedDependencies)
    } else {
      delete module.dependencies
      delete module.retainedDependencies
      delete module.asyncDependencies
      delete module.sharedDependencies
    }
    delete module.allDependencies
    return module
  })
  return result
}
