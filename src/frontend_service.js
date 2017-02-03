global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false;
global.__DEVTOOLS__ = global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

require('es6-promise').polyfill();

import 'isomorphic-fetch';
import reduxApi from 'redux-api';
import adapterFetch from 'redux-api/lib/adapters/fetch';

const fs = require('fs');
const path = require('path');
const express = require('express');
const React = require('react');
const ReactDOM = require('react-dom/server');
const HtmlHelper = require('./helpers/Html');
const PrettyError = require('pretty-error');
const match = require('react-router').match;
const ReduxAsyncConnect = require('redux-async-connect').ReduxAsyncConnect;
const loadOnServer = require('redux-async-connect').loadOnServer;
const createHistory = require('react-router/lib/createMemoryHistory');
const Provider = require('react-redux').Provider;
const routesProvider = require('./routes/routes');
const createStore = require('./redux/create');
const pretty = new PrettyError();
const WebpackIsomorphicTools = require('webpack-isomorphic-tools');
const WebpackIsomorphicToolsConf = require('./helpers/devtools/webpack/webpack-isomorphic-tools');
const Webpack = require('webpack');
const mustache = require('mustache');
const nconf = require('nconf');

function getFrontend(frontendConfig, reduxApiImpl, webpackIsomorphicTools) {
  return function provideFrontend(req, res, next) {
    if (__DEVELOPMENT__) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }

    const history = createHistory(req.originalUrl);
    let reducer = null;
    if (frontendConfig.reduxReducerPath) {
      reducer = require(path.resolve(frontendConfig.reduxReducerPath, frontendConfig.reduxReducerFileName));
    }

    const store = createStore(frontendConfig, reducer(reduxApiImpl.reducers), history);

    function hydrateOnClient() {
      res.send('<!doctype html>\n' + ReactDOM.renderToString(
        <HtmlHelper config={frontendConfig}
                    assets={webpackIsomorphicTools.assets()}
                    store={store}/>
        )
      );
    }

    if (__DISABLE_SSR__) {
      hydrateOnClient();
      return;
    }

    match({
      history,
      routes: routesProvider(store, frontendConfig),
      location: req.originalUrl
    }, (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        res.status(500);
        hydrateOnClient();
      } else if (renderProps) {
        loadOnServer({ ...renderProps, store }).then(() => {
          const component = (
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps}/>
            </Provider>
          );

          res.status(200);

          global.navigator = { userAgent: req.headers['user-agent'] };

          res.send('<!doctype html>\n' + ReactDOM.renderToString(
            <HtmlHelper config={frontendConfig}
                        assets={webpackIsomorphicTools.assets()}
                        component={component} store={store}/>
            )
          );
        });
      } else {
        res.status(404).send('Not found');
      }
    });
  }.bind(this);
}

class FrontendService {
  config = null;

  constructor() {}

  initialize() {
    this.routeConfig = this.config.routeConfig;

    if (this.config.routedComponentsPath) {
      if (this.config.AppComponentName) {
        this.config.AppComponent = require(path.resolve(this.config.routedComponentsPath, this.config.AppComponentName, this.config.AppComponentName));
      }
      if (this.config.NotFoundComponentName) {
        this.config.NotFoundComponent = require(path.resolve(this.config.routedComponentsPath, this.config.NotFoundComponentName, this.config.NotFoundComponentName));
      }
    }

    Object.keys(this.routeConfig).forEach((route) => {
      if (this.routeConfig[route].componentName) {
        this.routeConfig[route].component = require(path.resolve(this.config.routedComponentsPath, this.routeConfig[route].componentName, this.routeConfig[route].componentName));
      }
    });

    if (this.config.relayQueriesHelperPath) {
      this.config.relayQueries = require(path.resolve(this.config.relayQueriesHelperPath));
      this.config.relayPrepareParams = require(path.resolve(this.config.relayPrepareParamsPath));
      this.config.appQueries = (this.config.relayQueries && this.config.relayQueries[this.config.AppComponentQueriesName] ? this.config.relayQueries[this.config.AppComponentQueriesName] : null);
      this.config.appPrepareParams = (this.config.AppPreparedParamsFuncName && this.config.relayPrepareParams && this.config.relayPrepareParams[this.config.AppPreparedParamsFuncName] ? this.config.relayPrepareParams[this.config.AppPreparedParamsFuncName] : null);
    }

    this.reduxApiConfig = require(path.resolve(this.config.restReducerPath, this.config.restReducerFileName));
    this.reduxApiImpl = reduxApi(this.reduxApiConfig);
    this.reduxApiImpl
      .use("fetch", adapterFetch(fetch))
      .use("server", true);

    const helperTemplatePath = __dirname + '/templates/route_config_helper.mustache';

    fs.readFile(helperTemplatePath, (readRouteConfigHelperTemplateErr, routeConfigHelperTemplateData) => {
      if (readRouteConfigHelperTemplateErr) throw readRouteConfigHelperTemplateErr;

      const routeConfigObject = {
        containerPath: path.resolve(this.config.routedComponentsPath),
        relayQueriesPath: path.resolve(this.config.relayQueriesHelperPath),
        relayPrepareParamsPath: path.resolve(this.config.relayPrepareParamsPath),
        mainRoutePath: this.config.routePath,
        appComponentName: this.config.AppComponentName,
        appComponentQueriesName: this.config.AppComponentQueriesName,
        appName: this.config.appName,
        name: this.config.name,
        routes: Object.keys(this.config.routeConfig).map((key, idx) => {
          return {
            routeKeyName: key,
            routeIndex: idx,
            routeName: this.config.routeConfig[key].name,
            breadcrumbName: this.config.routeConfig[key].breadcrumbName,
            breadcrumbIgnore: this.config.routeConfig[key].breadcrumbIgnore || false,
            routePath: this.config.routeConfig[key].path,
            isIndexRoute: this.config.routeConfig[key].isIndexRoute,
            routePrepareParamFuncName: this.config.routeConfig[key].prepareParamFuncName,
            routeComponentName: this.config.routeConfig[key].componentName,
            routeComponentQueriesName: this.config.routeConfig[key].componentQueriesName,
            isLast: (idx >= Object.keys(this.config.routeConfig).length - 1)
          }
        })
      };

      //Routes are generated into the src and will be build into dist
      // frontend
      fs.mkdir(path.resolve(this.config.frontendSrcPath), (mkDirFrontendErr) => {
        if (mkDirFrontendErr && mkDirFrontendErr.code != 'EEXIST') throw mkDirFrontendErr;

        // helpers
        fs.mkdir(path.resolve(this.config.frontendSrcPath, this.config.helpersTargetPathName), (mkDirHelperErr) => {
          if (mkDirHelperErr && mkDirHelperErr.code != 'EEXIST') throw mkDirHelperErr;

          // routes
          fs.mkdir(path.resolve(this.config.frontendSrcPath, this.config.helpersTargetPathName, this.config.routeHelperPathName), (mkDirRoutesErr) => {
            if (mkDirRoutesErr && mkDirRoutesErr.code != 'EEXIST') throw mkDirRoutesErr;

              fs.writeFile(path.resolve(this.config.frontendSrcPath, this.config.helpersTargetPathName, this.config.routeHelperPathName, this.config.routeHelperFileName + '.js'), mustache.render(routeConfigHelperTemplateData.toString(), routeConfigObject), (err) => {
              if (err) throw err;

              console.log('RouteConfigHelper JS generated!');
            });
          });
        });
      });

      if (this.config.webpack && process.env.NO_WEBPACK != "1") {
        const compiler = Webpack(this.config.webpackConfig);

        const port = parseInt(this.config.webpackPort);
        const serverOptions = {
          contentBase: this.config.webpackContentBaseProtocol + this.config.webpackContentBaseHost + ':' + this.config.webpackContentBasePort,
          quiet: true,
          noInfo: true,
          hot: true,
          inline: true,
          lazy: false,
          publicPath: this.config.webpackConfig.output.publicPath,
          headers: { "Access-Control-Allow-Origin": '*' },
          stats: { colors: true }
        };

        const app = new express();

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

    const isoToolsConfig = WebpackIsomorphicToolsConf(this.config.appConfig);

    if (this.config.webpack && this.config.webpackConfigPath) {
      this.config.webpackConfig = require(path.resolve(this.config.webpackConfigPath, this.config.webpackEnvironment, this.config.webpackConfigFileName))(this.config, isoToolsConfig);
    }

    return new Promise((resolve) => {
      this.webpackIsomorphicTools = new WebpackIsomorphicTools(isoToolsConfig).server(path.normalize(process.cwd()), () => {
        resolve(true);
      });
    });
  }

  getFrontend() {
    return getFrontend.bind(this)(this.config, this.reduxApiImpl, this.webpackIsomorphicTools);
  }
}

exports = module.exports = FrontendService;
exports.HtmlHelper = HtmlHelper;
exports.FrontendService = FrontendService;
