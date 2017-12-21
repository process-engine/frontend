'use strict';

var FrontendService = require('./dist/commonjs/index').FrontendService;

function registerInContainer(container) {

  container.register('FrontendService', FrontendService)
    .dependencies('ServerSideRenderService')
    .injectPromiseLazy('ServerSideRenderService')
    .configure('frontend:service')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
