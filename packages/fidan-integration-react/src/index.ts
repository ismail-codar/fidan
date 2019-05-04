import * as React from "react";
import * as ReactDOM from "react-dom";
import { compute, FidanValue } from "@fidanjs/runtime";

export const reactToDom = <T>(
  Tag,
  attributes: {
    [key in keyof T]:
      | FidanValue<typeof attributes[key]>
      | typeof attributes[key]
  },
  ...childs: any[]
) => {
  const parent = document.createElement("template");

  const RenderWrapper = class extends React.Component {
    state = {};
    dynamics = [];
    componentDidMount() {
      const props = this.props;

      compute(
        () => {
          var newState = {};
          for (var key in this.props) {
            if (
              typeof props[key] === "function" &&
              props[key].hasOwnProperty("$val")
            ) {
              newState[key] = props[key]();
            }
          }
          this.setState(newState);
        },
        () => this.dynamics
      );
    }
    constructor(props) {
      super(props);
      for (var key in props) {
        if (
          typeof props[key] === "function" &&
          props[key].hasOwnProperty("$val")
        ) {
          this.dynamics.push(props[key]);
          this.state[key] = props[key]();
        } else this.state[key] = props[key];
      }
    }
    render() {
      return React.createElement(Tag, this.state, ...childs);
    }
  };
  ReactDOM.render(React.createElement(RenderWrapper, attributes), parent);
  return parent.firstElementChild;
};

export const domToReact = (dom: DocumentFragment) => {
  const integrationDomRef = (element: HTMLTemplateElement) => {
    if (element) {
      element.replaceWith(dom.cloneNode(true));
    }
  };

  return React.createElement(
    React.Fragment,
    {},
    React.createElement("template", {
      ref: integrationDomRef
    })
  );
};
