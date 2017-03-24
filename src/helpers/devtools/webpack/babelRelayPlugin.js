const fs = require('fs');
const path = require('path');
const appRoot = path.normalize(process.cwd());
const getBabelRelayPlugin = require('babel-relay-plugin');

let schema = null;
if (fs.existsSync(appRoot + '/graphql-schema.json')) {
  const schemaData = require(appRoot + '/graphql-schema.json').data;
  schema = getBabelRelayPlugin(schemaData);
}

module.exports = schema;
