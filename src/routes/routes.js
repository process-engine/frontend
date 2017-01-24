'use strict';

import { routeConfig } from './config';

const routesProvider = (store, frontendConfig) => routeConfig(store, frontendConfig).buildReactRoutes;
exports = module.exports = routesProvider;
