const _ = require('lodash')
const zlib = require('zlib')
const shortenIdentifier = require('./helpers').shortenIdentifier
const baseName = require('./helpers').baseName

function parseModules(modules, options) {
  names = {}
  return _.transform(modules, function(result, webpackModule) {
    const module = _.pick(webpackModule, ['id', 'identifier', 'name', 'size', 'cacheable', 'chunks', 'assets', 'reasons'])
    if (options.gzip) {
      module.size = zlib.gzipSync(webpackModule.source || '', {level: 9}).length
    }
    var name = baseName(module.name)
    // module.shortIdentifier = shortenIdentifier(module.identifier, options)
    module.duplicate = false
    if (names[name]) {
      module.duplicate = name
      name = shortenIdentifier(module.identifier, options)
    }
    module.name = name
    names[name] = true
    module.dependencies = {}
    result[module.identifier] = module
  }, {
    root: {
      id: -1,
      identifier: 'root',
      name: 'root',
      size: 0,
      chunks: [],
      assets: [],
      reasons: [],
      dependencies: {},
    }
  })
}

function resolveDependencies(modules, options) {
  _.forEach(modules, function(module) {
    if (_.size(module.reasons) === 0 && module.identifier !== 'root') {
      module.reasons = [
        {moduleIdentifier: 'root'}
      ]
    }
    module.reasons = _.transform(module.reasons, function(reasons, reason) {
      const reasonModule = modules[reason.moduleIdentifier]
      if (!reasonModule) {
        throw new Error('Unknown module ' + reason.moduleIdentifier)
      }
      reasons[reason.moduleIdentifier] = reasonModule
      reasonModule.dependencies[module.identifier] = module
    }, {})
  })
}

function gatherDependencies(module) {
  if (module.allDependencies) return
  // circular ref
  if (module._gatheringDeps) return
  module._gatheringDeps = true
  module.allDependencies = _.clone(module.dependencies)
  _.forEach(module.dependencies, function(dependency) {
    gatherDependencies(dependency)
    Object.assign(module.allDependencies, dependency.allDependencies)
  })
  delete module._gatheringDeps
}

// verifies if onlyReason is the only module holding this dependency
function isOnlyReason(module, onlyReason) {
  if (module === onlyReason) return true
  if (_.size(module.reasons) === 0) return false

  // circular ref
  if (module._checkingReason) return undefined

  module._checkingReason = true

  const result = _.every(module.reasons, function(reason) {
    return isOnlyReason(reason, onlyReason) !== false
  })

  delete module._checkingReason
  return result
}
isOnlyReason = _.memoize(isOnlyReason, function(a, b) {
  return a.identifier + ' / ' + b.identifier
})

function calculateDependencies(module) {
  if (module.retainedSize !== undefined) return
  // circular ref
  if (module._calculatingDeps) return
  module._calculatingDeps = true

  module.retainedSize = module.size
  module.sharedSize = 0
  module.retainedCount = 0
  module.sharedCount = 0
  module.retainedDependencies = []
  module.sharedDependencies = []
  module.directCount = _.size(module.dependencies)
  module.reasonCount = _.size(module.reasons)
  module.allCount = _.size(module.allDependencies)

  _.forEach(module.allDependencies, function(dependency) {
    if (isOnlyReason(dependency, module)) {
      module.retainedDependencies.push(dependency)
      module.retainedSize += dependency.size
      module.retainedCount += 1
    } else {
      module.sharedDependencies.push(dependency)
      module.sharedSize += dependency.size
      module.sharedCount += 1
    }
  })

  module.allSize = module.retainedSize + module.sharedSize

  delete module._calculatingDeps
}


module.exports = function analyse(stats, options) {
  const modules = parseModules(stats.modules, options)
  resolveDependencies(modules, options)
  _.forEach(modules, gatherDependencies)
  _.forEach(modules, calculateDependencies)
  return {
    modules: modules
  }
}
