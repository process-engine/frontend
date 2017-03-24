'use strict';

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.routeConfig = function () {
  var routes = {};

  var buildRouting = function buildRouting(store, frontendConfig) {
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

    var routes = {
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

    var buildRoutingBlocks = function buildRoutingBlocks(singleRouteConfig) {
      var isIndexRoute = singleRouteConfig.isIndexRoute,
          childRoutes = singleRouteConfig.childRoutes,
          rest = (0, _objectWithoutProperties3.default)(singleRouteConfig, ['isIndexRoute', 'childRoutes']);

      // remove from residual props as they are forwarded to the Route component

      delete rest.backendDependencies;
      delete rest.componentName;

      var RouteElement = isIndexRoute ? _reactRouter.IndexRoute : _reactRouter.Route;

      var childRouteBlocks = [];
      if (childRoutes) {
        Object.keys(childRoutes).forEach(function (childRouteKey) {
          childRouteBlocks.push(buildRoutingBlocks(childRoutes[childRouteKey]));
        });
      }

      return _react2.default.createElement(
        RouteElement,
        rest,
        childRouteBlocks
      );
    };

    return {
      buildReactRoutes: buildRoutingBlocks(routes.__APP__),
      routes: routes
    };
  };

  return function (store, frontendConfig) {
    return buildRouting(store, frontendConfig);
  };
}();
//# sourceMappingURL=config.js.map
