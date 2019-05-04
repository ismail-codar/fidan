"use strict";
// original: https://github.com/ryansolid/dom-expressions/blob/master/src/Attributes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const Types = {
    ATTRIBUTE: "attribute",
    PROPERTY: "property"
};
exports.Attributes = {
    href: {
        type: Types.ATTRIBUTE
    },
    style: {
        type: Types.PROPERTY,
        alias: "style.cssText"
    },
    for: {
        type: Types.PROPERTY,
        alias: "htmlFor"
    },
    class: {
        type: Types.PROPERTY,
        alias: "className"
    },
    // React compat
    spellCheck: {
        type: Types.PROPERTY,
        alias: "spellcheck"
    },
    allowFullScreen: {
        type: Types.PROPERTY,
        alias: "allowFullscreen"
    },
    autoCapitalize: {
        type: Types.PROPERTY,
        alias: "autocapitalize"
    },
    autoFocus: {
        type: Types.PROPERTY,
        alias: "autofocus"
    },
    autoPlay: {
        type: Types.PROPERTY,
        alias: "autoplay"
    }
};
//# sourceMappingURL=Attributes.js.map