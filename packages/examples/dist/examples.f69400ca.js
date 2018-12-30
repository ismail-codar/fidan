// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"node_modules/@fidan/runtime/build/index.js":[function(require,module,exports) {
var e=[],t={},n=function(n,o){t[n]||(t[n]=[]),t[n].push(o),e.push(n)},o=function(n){n.$context||Object.defineProperty(n,"$context",{configurable:!1,enumerable:!1,value:{}});for(var o=null,r=0;r<e.length;r++)n.$context[o=e[r]]=t[o][t[o].length-1]},r=function(n){t[n].pop(),e.pop()},a=/^on[A-Z]/,c=Symbol("fidan.Fragment"),l={id:!0,nodeValue:!0,textContent:!0,className:!0,innerHTML:!0,tabIndex:!0,value:!0},i=function(e,t){var n=null;for(var o in t)if(null!=(n=t[o]))if(n instanceof Function)a.test(o)?e[o=o.toLowerCase()]=n:n(e);else if(n instanceof Object)if(Array.isArray(n))s(e,n);else for(var r in n)"function"==typeof n[r]?n[r](e):e[o][r]=n[r];else!0===l[name]?e[o]=n:e.setAttribute(name,n)},s=function(e,t){for(var n=null,o=0;o<t.length;o++)Array.isArray(t[o])?s(e,t[o]):t[o]instanceof Function?t[o](e):t[o]&&(n=t[o].props$,e.appendChild(t[o]instanceof Node?t[o]:document.createTextNode(t[o])),n&&n.didMount&&n.didMount(e,t[o]))};exports.Fragment=c,exports.setElementAttributes=i,exports.createElement=function(e,t){for(var n=[],r=arguments.length-2;r-- >0;)n[r]=arguments[r+2];var a=null;return e instanceof Function?(null===t&&(t={}),n&&n.length&&(t.children=n),o(t),(a=e(t))&&(a.props$=t)):(e===c?a=document.createDocumentFragment():(a=document.createElement(e),t&&i(a,t)),a.props$=t,n&&n.length&&s(a,n)),a},exports.createSvgElement=function(e,t){for(var n=[],o=arguments.length-2;o-- >0;)n[o]=arguments[o+2];var r=document.createElementNS("http://www.w3.org/2000/svg",e);return t&&(t.className&&(t.class=t.className,delete t.className),i(r,t)),r.props$=t,n&&n.length&&s(r,n),r},exports.addChildElements=s,exports.createTextNode=function(e){return e.appendChild(document.createTextNode(""))},exports.startContext=n,exports.getContextValue=function(e,n){return n&&n.$context[e]?n.$context[e]:t[e]?t[e][t[e].length-1]:void 0},exports.injectContexts=o,exports.endContext=r,exports.activateContext=function(e){for(var t in e)n(t,e[t])},exports.deactivateContext=function(e){for(var t in e)r(t)},exports.Context=function(e){return null};


},{}],"views/Main.tsx":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

exports.Main = function () {
  var dv1 = null;
  var view = dv1 = fidan("div", null, "Main View");
  console.log(dv1);
  return view;
};
},{}],"index.tsx":[function(require,module,exports) {
var global = arguments[3];
"use strict";

exports.__esModule = true;

var runtime_1 = require("@fidan/runtime");

var Main_1 = require("./views/Main");

global['fidan'] = runtime_1.createElement;
var mainView = fidan(Main_1.Main, null);

if ("development" === 'development') {
  if (module['hot']) {
    module['hot'].dispose(function () {
      document.body.removeChild(mainView);
    });
  }
}

document.body.appendChild(mainView);
},{"@fidan/runtime":"node_modules/@fidan/runtime/build/index.js","./views/Main":"views/Main.tsx"}],"../../../../../../../usr/local/lib/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "62214" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../../../../../usr/local/lib/node_modules/parcel/src/builtins/hmr-runtime.js","index.tsx"], null)
//# sourceMappingURL=/examples.f69400ca.map