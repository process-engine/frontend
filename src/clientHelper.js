'use strict';

const reduxStore = require('./redux/create');
const routesProvider = require('./routes/routes');
const DevTools = require('./helpers/devtools/devtools');

exports.reduxStore = reduxStore;
exports.routesProvider = routesProvider;
exports.DevTools = DevTools;
