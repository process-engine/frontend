'use strict';

var _config = require('./config');

var routesProvider = function routesProvider(store, frontendConfig) {
  return (0, _config.routeConfig)(store, frontendConfig).buildReactRoutes;
};
exports = module.exports = routesProvider;
//# sourceMappingURL=routes.js.map
