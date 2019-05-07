// original: https://github.com/ryansolid/dom-expressions/blob/master/src/Attributes.ts

type AttributeInfo = {
  [key: string]: {
    type: string;
    alias?: string;
  };
};

const Types = {
  ATTRIBUTE: "attribute",
  PROPERTY: "property"
};

export const HtmlAttributes: AttributeInfo = {
  htmlFor: {
    type: Types.PROPERTY,
    alias: "for"
  },
  className: {
    type: Types.PROPERTY,
    alias: "class"
  }
};

export const Attributes: AttributeInfo = {
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
