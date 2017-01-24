'use strict';

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var appRoot = path.normalize(process.cwd());

var _require = require('redux-devtools'),
    persistState = _require.persistState;

var DevTools = require('../helpers/devtools/devtools');

function createStore(config, reducer, history, data) {
    var finalCreateStore = void 0;
    if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
        finalCreateStore = (0, _redux.compose)((0, _redux.applyMiddleware)(_reduxThunk2.default), window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(), persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)))(_redux.createStore);
    } else {
        finalCreateStore = (0, _redux.compose)((0, _redux.applyMiddleware)(_reduxThunk2.default))(_redux.createStore);
    }

    var store = finalCreateStore(reducer, data);

    if (__DEVELOPMENT__ && module.hot && config) {
        module.hot.accept(appRoot + '/' + config.reducerPath + '/' + config.reducerFileName, function () {
            store.replaceReducer(reducer);
        });
    }

    return store;
}

exports = module.exports = createStore;
//# sourceMappingURL=create.js.map
