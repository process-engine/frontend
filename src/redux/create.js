'use strict';

import { applyMiddleware, createStore as _createStore, compose } from 'redux';
import thunk from "redux-thunk";

const path = require('path');
const appRoot = path.normalize(process.cwd());

const { persistState } = require('redux-devtools');
const DevTools = require('../helpers/devtools/devtools');

function createStore(config, reducer, history, data) {
  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    finalCreateStore = compose(
      applyMiddleware(thunk),
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore);
  } else {
    finalCreateStore = compose(
      applyMiddleware(thunk)
    )(_createStore);
  }

  const store = finalCreateStore(reducer, data);

  if (__DEVELOPMENT__ && module.hot && config) {
    module.hot.accept(appRoot + '/' + config.reducerPath + '/' + config.reducerFileName, () => {
      store.replaceReducer(reducer);
    });
  }

  return store;
}

exports = module.exports = createStore;
