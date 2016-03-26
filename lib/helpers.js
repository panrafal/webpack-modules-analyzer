const escapeStringRegexp = require('escape-string-regexp')

exports.shortenIdentifier = function shortenIdentifier(id, options) {
  if (options.root) return id.replace(new RegExp(escapeStringRegexp(options.root), 'g'), '')
  return id
}

exports.baseName = function baseName(name) {
  return name.replace(/^.+!/, '')
}
