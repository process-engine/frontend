'use strict';

import { routeConfig } from './config';

const routesProvider = (store, frontendConfig, injectables) => routeConfig(store, frontendConfig, injectables).buildReactRoutes;
exports = module.exports = routesProvider;
