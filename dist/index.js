'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _frontend_service = require('./frontend_service');

Object.keys(_frontend_service).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _frontend_service[key];
    }
  });
});
//# sourceMappingURL=index.js.map
