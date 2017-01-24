'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _serializeJavascript = require('serialize-javascript');

var _serializeJavascript2 = _interopRequireDefault(_serializeJavascript);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */

var path = require('path');

var bootstrapConfig = null;

var Html = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(Html, _Component);

    function Html() {
        (0, _classCallCheck3.default)(this, Html);
        return (0, _possibleConstructorReturn3.default)(this, (Html.__proto__ || Object.getPrototypeOf(Html)).apply(this, arguments));
    }

    (0, _createClass3.default)(Html, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                assets = _props.assets,
                component = _props.component,
                store = _props.store;

            var content = component ? _server2.default.renderToString(component) : '';
            var head = _reactHelmet2.default.rewind();

            if (this.props.config && this.props.config.themePath && this.props.config.themeName) {
                bootstrapConfig = require(path.resolve(this.props.config.themePath, this.props.config.themeName, 'bootstrap_config.js'));
            }

            var messageBusProvider = null;
            if (this.props.config.messageBus) {
                messageBusProvider = _react2.default.createElement('script', { src: "/" + (this.props.config.messageBusEndPointName || 'faye') + "/client.js", charSet: 'UTF-8' });
            }
            return _react2.default.createElement(
                'html',
                { lang: 'en-us' },
                _react2.default.createElement(
                    'head',
                    null,
                    head.base.toComponent(),
                    head.title.toComponent(),
                    head.meta.toComponent(),
                    head.link.toComponent(),
                    head.script.toComponent(),
                    _react2.default.createElement('link', { rel: 'shortcut icon', href: '/favicon.ico' }),
                    _react2.default.createElement('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
                    Object.keys(assets.styles).map(function (style, key) {
                        return _react2.default.createElement('link', { href: assets.styles[style], key: key, media: 'screen, projection', rel: 'stylesheet', type: 'text/css', charSet: 'UTF-8' });
                    }),
                    Object.keys(assets.styles).length === 0 ? _react2.default.createElement('style', { dangerouslySetInnerHTML: { __html: (bootstrapConfig ? bootstrapConfig : '') + require(path.resolve(this.props.config.routedComponentsPath, this.props.config.AppComponentName, this.props.config.AppComponentName + '.scss'))._style } }) : null
                ),
                _react2.default.createElement(
                    'body',
                    null,
                    _react2.default.createElement('div', { id: 'content', dangerouslySetInnerHTML: { __html: content } }),
                    _react2.default.createElement('script', { dangerouslySetInnerHTML: { __html: 'window.__data=' + (0, _serializeJavascript2.default)(store.getState()) + ';' }, charSet: 'UTF-8' }),
                    messageBusProvider,
                    _react2.default.createElement('script', { src: assets.javascript.main, charSet: 'UTF-8' })
                )
            );
        }
    }]);
    return Html;
}(_react.Component), _class.propTypes = {
    assets: _react.PropTypes.object,
    component: _react.PropTypes.node,
    store: _react.PropTypes.object
}, _temp);


exports = module.exports = Html;
//# sourceMappingURL=Html.js.map
