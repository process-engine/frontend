'use strict';

import React, { Component } from 'react';
import { IndexRoute, Route } from 'react-router';

module.exports.routeConfig = (function() {
  let routes = {};

  const buildRouting = (store, frontendConfig) => {
    // Wrap routes into a root route
    // Add the 404 route by default
    frontendConfig.routeConfig.__404__ = {
      key: Object.keys(frontendConfig.routeConfig).length,
      status: 404,
      name: 'notfound',
      breadcrumbName: 'Seitenfehler',
      breadcrumbIgnore: true,
      path: '*',
      component: frontendConfig.NotFoundComponent
    };

    const routes = {
      __APP__: {
        key: 0,
        path: frontendConfig.routePath,
        name: frontendConfig.appName,
        breadcrumbName: frontendConfig.name,
        breadcrumbIgnore: true,
        component: frontendConfig.AppComponent,
        queries: frontendConfig.appQueries,
        prepareParams: frontendConfig.appPrepareParams,
        childRoutes: frontendConfig.routeConfig
      }
    };

    const buildRoutingBlocks = (singleRouteConfig) => {
      const { isIndexRoute, childRoutes, ...rest } = singleRouteConfig;

      // remove from residual props as they are forwarded to the Route component
      delete rest.backendDependencies;
      delete rest.componentName;

      const RouteElement = (isIndexRoute ? IndexRoute : Route);

      let childRouteBlocks = [];
      if (childRoutes) {
        Object.keys(childRoutes).forEach((childRouteKey) => {
          childRouteBlocks.push(buildRoutingBlocks(childRoutes[childRouteKey]));
        });
      }

      return (
        <RouteElement {...rest}>
          {childRouteBlocks}
        </RouteElement>
      );
    };

    return {
      buildReactRoutes: buildRoutingBlocks(routes.__APP__),
      routes
    };
  };

  return (store, frontendConfig) => buildRouting(store, frontendConfig);
}());
