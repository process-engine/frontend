'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

require('isomorphic-fetch');

var _reduxApi = require('redux-api');

var _reduxApi2 = _interopRequireDefault(_reduxApi);

var _fetch = require('redux-api/lib/adapters/fetch');

var _fetch2 = _interopRequireDefault(_fetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false;
global.__DEVTOOLS__ = global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

require('es6-promise').polyfill();

var fs = require('fs');
var path = require('path');
var express = require('express');
var React = require('react');
var ReactDOM = require('react-dom/server');
var HtmlHelper = require('./helpers/Html');
var PrettyError = require('pretty-error');
var match = require('react-router').match;
var ReduxAsyncConnect = require('redux-async-connect').ReduxAsyncConnect;
var loadOnServer = require('redux-async-connect').loadOnServer;
var createHistory = require('react-router/lib/createMemoryHistory');
var Provider = require('react-redux').Provider;
var routesProvider = require('./routes/routes');
var createStore = require('./redux/create');
var pretty = new PrettyError();
var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
var WebpackIsomorphicToolsConf = require('./helpers/devtools/webpack/webpack-isomorphic-tools');
var Webpack = require('webpack');
var mustache = require('mustache');
var nconf = require('nconf');

function _getFrontend(frontendConfig, reduxApiImpl, webpackIsomorphicTools) {
  return function provideFrontend(req, res, next) {
    if (__DEVELOPMENT__) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }

    var history = createHistory(req.originalUrl);
    var reducer = null;
    if (frontendConfig.reduxReducerPath) {
      reducer = require(path.resolve(frontendConfig.buildReduxReducerPath, frontendConfig.reduxReducerFileName));
    }

    var store = createStore(frontendConfig, reducer(reduxApiImpl.reducers), history);

    function hydrateOnClient() {
      res.send('<!doctype html>\n' + ReactDOM.renderToString(React.createElement(HtmlHelper, { config: frontendConfig,
        assets: webpackIsomorphicTools.assets(),
        store: store })));
    }

    if (__DISABLE_SSR__) {
      hydrateOnClient();
      return;
    }

    match({
      history: history,
      routes: routesProvider(store, frontendConfig),
      location: req.originalUrl
    }, function (error, redirectLocation, renderProps) {
      if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        res.status(500);
        hydrateOnClient();
      } else if (renderProps) {
        loadOnServer((0, _extends3.default)({}, renderProps, { store: store })).then(function () {
          var component = React.createElement(
            Provider,
            { store: store, key: 'provider' },
            React.createElement(ReduxAsyncConnect, renderProps)
          );

          res.status(200);

          global.navigator = { userAgent: req.headers['user-agent'] };

          res.send('<!doctype html>\n' + ReactDOM.renderToString(React.createElement(HtmlHelper, { config: frontendConfig,
            assets: webpackIsomorphicTools.assets(),
            component: component, store: store })));
        });
      } else {
        res.status(404).send('Not found');
      }
    });
  }.bind(this);
}

var FrontendService = function () {
  function FrontendService() {
    (0, _classCallCheck3.default)(this, FrontendService);
    this.config = null;
  }

  (0, _createClass3.default)(FrontendService, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this.routeConfig = this.config.routeConfig;

      if (this.config.routedComponentsPath) {
        if (this.config.AppComponentName) {
          this.config.AppComponent = require(path.resolve(this.config.buildRoutedComponentsPath, this.config.AppComponentName, this.config.AppComponentName));
        }
        if (this.config.NotFoundComponentName) {
          this.config.NotFoundComponent = require(path.resolve(this.config.buildRoutedComponentsPath, this.config.NotFoundComponentName, this.config.NotFoundComponentName));
        }
      }

      Object.keys(this.routeConfig).forEach(function (route) {
        if (_this.routeConfig[route].componentName) {
          _this.routeConfig[route].component = require(path.resolve(_this.config.buildRoutedComponentsPath, _this.routeConfig[route].componentName, _this.routeConfig[route].componentName));
        }
      });

      if (this.config.relayQueriesHelperPath) {
        this.config.relayQueries = require(path.resolve(this.config.buildRelayQueriesHelperPath));
        this.config.relayPrepareParams = require(path.resolve(this.config.buildRelayPrepareParamsPath));
        this.config.appQueries = this.config.relayQueries && this.config.relayQueries[this.config.AppComponentQueriesName] ? this.config.relayQueries[this.config.AppComponentQueriesName] : null;
        this.config.appPrepareParams = this.config.AppPreparedParamsFuncName && this.config.relayPrepareParams && this.config.relayPrepareParams[this.config.AppPreparedParamsFuncName] ? this.config.relayPrepareParams[this.config.AppPreparedParamsFuncName] : null;
      }

      this.reduxApiConfig = require(path.resolve(this.config.buildRestReducerPath, this.config.restReducerFileName));
      this.reduxApiImpl = (0, _reduxApi2.default)(this.reduxApiConfig);
      this.reduxApiImpl.use("fetch", (0, _fetch2.default)(fetch)).use("server", true);

      var helperTemplatePath = __dirname + '/templates/route_config_helper.mustache';

      fs.readFile(helperTemplatePath, function (readRouteConfigHelperTemplateErr, routeConfigHelperTemplateData) {
        if (readRouteConfigHelperTemplateErr) throw readRouteConfigHelperTemplateErr;

        var routeConfigObject = {
          containerPath: path.resolve(_this.config.routedComponentsPath),
          relayQueriesPath: path.resolve(_this.config.relayQueriesHelperPath),
          relayPrepareParamsPath: path.resolve(_this.config.relayPrepareParamsPath),
          mainRoutePath: _this.config.routePath,
          appComponentName: _this.config.AppComponentName,
          appComponentQueriesName: _this.config.AppComponentQueriesName,
          appName: _this.config.appName,
          name: _this.config.name,
          routes: Object.keys(_this.config.routeConfig).map(function (key, idx) {
            return {
              routeKeyName: key,
              routeIndex: idx,
              routeName: _this.config.routeConfig[key].name,
              breadcrumbName: _this.config.routeConfig[key].breadcrumbName,
              breadcrumbIgnore: _this.config.routeConfig[key].breadcrumbIgnore || false,
              routePath: _this.config.routeConfig[key].path,
              isIndexRoute: _this.config.routeConfig[key].isIndexRoute,
              routePrepareParamFuncName: _this.config.routeConfig[key].prepareParamFuncName,
              routeComponentName: _this.config.routeConfig[key].componentName,
              routeComponentQueriesName: _this.config.routeConfig[key].componentQueriesName,
              isLast: idx >= Object.keys(_this.config.routeConfig).length - 1
            };
          })
        };

        //Routes are generated into the src and will be build into dist
        // frontend
        fs.mkdir(path.resolve(_this.config.frontendSrcPath), function (mkDirFrontendErr) {
          if (mkDirFrontendErr && mkDirFrontendErr.code != 'EEXIST') throw mkDirFrontendErr;

          // helpers
          fs.mkdir(path.resolve(_this.config.frontendSrcPath, _this.config.helpersTargetPathName), function (mkDirHelperErr) {
            if (mkDirHelperErr && mkDirHelperErr.code != 'EEXIST') throw mkDirHelperErr;

            // routes
            fs.mkdir(path.resolve(_this.config.frontendSrcPath, _this.config.helpersTargetPathName, _this.config.routeHelperPathName), function (mkDirRoutesErr) {
              if (mkDirRoutesErr && mkDirRoutesErr.code != 'EEXIST') throw mkDirRoutesErr;

              fs.writeFile(path.resolve(_this.config.frontendSrcPath, _this.config.helpersTargetPathName, _this.config.routeHelperPathName, _this.config.routeHelperFileName + '.js'), mustache.render(routeConfigHelperTemplateData.toString(), routeConfigObject), function (err) {
                if (err) throw err;

                console.log('RouteConfigHelper JS generated!');
              });
            });
          });
        });

        if (_this.config.webpack && process.env.NO_WEBPACK != "1") {
          var compiler = Webpack(_this.config.webpackConfig);

          var port = parseInt(_this.config.webpackPort);
          var serverOptions = {
            contentBase: _this.config.webpackContentBaseProtocol + _this.config.webpackContentBaseHost + ':' + _this.config.webpackContentBasePort,
            quiet: true,
            noInfo: true,
            hot: true,
            inline: true,
            lazy: false,
            publicPath: _this.config.webpackConfig.output.publicPath,
            headers: { "Access-Control-Allow-Origin": '*' },
            stats: "minimal",
            watchOptions: {
              ignored: /node_modules/,
              aggregateTimeout: 500,
              poll: 2000
            }
          };

          var app = new express();

          app.use(require('webpack-dev-middleware')(compiler, serverOptions));
          app.use(require('webpack-hot-middleware')(compiler));

          app.listen(port, function onAppListening(err) {
            if (err) {
              console.error(err);
            } else {
              console.info('==> 🚧  Webpack development server listening on port %s', port);
            }
          });
        }
      });

      var isoToolsConfig = WebpackIsomorphicToolsConf(this.config.appConfig);

      if (this.config.webpack && this.config.webpackConfigPath) {
        this.config.webpackConfig = require(path.resolve(this.config.webpackConfigPath, this.config.webpackEnvironment, this.config.webpackConfigFileName))(this.config, isoToolsConfig);
      }

      return new Promise(function (resolve) {
        _this.webpackIsomorphicTools = new WebpackIsomorphicTools(isoToolsConfig).server(path.normalize(process.cwd()), function () {
          resolve(true);
        });
      });
    }
  }, {
    key: 'getFrontend',
    value: function getFrontend() {
      return _getFrontend.bind(this)(this.config, this.reduxApiImpl, this.webpackIsomorphicTools);
    }
  }]);
  return FrontendService;
}();

exports = module.exports = FrontendService;
exports.HtmlHelper = HtmlHelper;
exports.FrontendService = FrontendService;
//# sourceMappingURL=frontend_service.js.map
