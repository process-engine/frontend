'use strict';

const FrontendService = require('./dist/commonjs/index').FrontendService;

function registerInContainer(container) {

  container.register('FrontendService', FrontendService)
    .configure('frontend:service')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
