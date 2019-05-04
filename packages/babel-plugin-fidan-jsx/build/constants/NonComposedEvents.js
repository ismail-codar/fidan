"use strict";
// original: https://github.com/ryansolid/dom-expressions/blob/master/src/NonComposedEvents.ts
Object.defineProperty(exports, "__esModule", { value: true });
// list of Element events that will not be delegated even if camelCased
exports.NonComposedEvents = new Set([
    "abort",
    "animationstart",
    "animationend",
    "animationiteration",
    "blur",
    "change",
    "copy",
    "cut",
    "error",
    "focus",
    "load",
    "loadend",
    "loadstart",
    "mouseenter",
    "mouseleave",
    "paste",
    "progress",
    "reset",
    "select",
    "submit",
    "transitionstart",
    "transitioncancel",
    "transitionend",
    "transitionrun"
]);
//# sourceMappingURL=NonComposedEvents.js.map