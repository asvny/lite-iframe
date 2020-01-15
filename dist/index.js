
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./lite-iframe.cjs.production.min.js')
} else {
  module.exports = require('./lite-iframe.cjs.development.js')
}
