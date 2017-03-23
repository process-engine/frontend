'use strict';

var fs = require('fs');
var path = require('path');
var appRoot = path.normalize(process.cwd());
var getBabelRelayPlugin = require('babel-relay-plugin');

var schema = null;
if (fs.existsSync(appRoot + '/graphql-schema.json')) {
  var schemaData = require(appRoot + '/graphql-schema.json').data;
  schema = getBabelRelayPlugin(schemaData);
}

module.exports = schema;
//# sourceMappingURL=babelRelayPlugin.js.map
