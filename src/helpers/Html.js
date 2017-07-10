'use strict';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom/server';
import serialize from 'serialize-javascript';
import Helmet from 'react-helmet';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */


const path = require('path');

class Html extends Component {
  static propTypes = {
    assets: PropTypes.object,
    component: PropTypes.node,
    store: PropTypes.object
  };

  render() {
    const { assets, component, store } = this.props;
    const content = component ? ReactDOM.renderToString(component) : '';
    const head = Helmet.rewind();

    let messageBusProvider = null;
    if (this.props.config.messageBus) {
      messageBusProvider = (
        <script src={"/" + (this.props.config.messageBusEndPointName || 'faye') + "/client.js"} charSet="UTF-8"/>);
    }

    let staticScriptTags = [];
    if (this.props.config.staticDlls) {
      this.props.config.staticDlls.split(',').forEach((elem) => {
        staticScriptTags.push(<script src={"/" + (this.props.config.staticDllURLPath + "/" + elem.trim() + ".dll.js")} charSet="UTF-8"/>);
      });
    }
    let staticLinkTags = [];
    if (this.props.config.staticLinks) {
      this.props.config.staticLinks.forEach((elem) => {
        staticLinkTags.push(<link rel={elem.type} href={elem.href} charSet="UTF-8"/>);
      });
    }

    return (
      <html lang="en-us">
      <head>
        {head.base.toComponent()}
        {head.title.toComponent()}
        {head.meta.toComponent()}
        {head.link.toComponent()}
        {head.script.toComponent()}

        {staticScriptTags}

        {staticLinkTags}

        <link rel="shortcut icon" href="/favicon.ico"/>

        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        {/* styles (will be present only in production with webpack extract text plugin) */}
        {Object.keys(assets.styles).map((style, key) =>
          <link href={assets.styles[style]} key={key} media="screen, projection" rel="stylesheet" type="text/css"
                charSet="UTF-8"/>
        )}

        {/* (will be present only in development mode) */}
        {/* outputs a <style/> tag with all bootstrap styles + App.scss + it could be CurrentPage.scss. */}
        {/* can smoothen the initial style flash (flicker) on page load in development mode. */}
        {/* ideally one could also include here the style for the current page (Home.scss, About.scss, etc) */}
        {Object.keys(assets.styles).length === 0 ? <style
            dangerouslySetInnerHTML={{ __html: require(path.resolve(this.props.config.routedComponentsPath, this.props.config.AppComponentName, this.props.config.AppComponentName + '.scss'))._style }}/> : null}
      </head>
      <body>
      <div id="content" dangerouslySetInnerHTML={{ __html: content }}/>
      <script dangerouslySetInnerHTML={{ __html: `window.__data=${serialize(store.getState())};` }} charSet="UTF-8"/>
      {messageBusProvider}
      <script src={assets.javascript.main} charSet="UTF-8"/>
      </body>
      </html>
    );
  }
}

exports = module.exports = Html;
