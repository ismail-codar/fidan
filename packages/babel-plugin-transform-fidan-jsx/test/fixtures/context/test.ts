//fjsx.Context createElement i bul
//arguments.push(fjsx.endContext())

const Component1 = () => {
  console.log("Component1");
  return null;
};
const fjsx = {
  Context: () => {
    debugger;
    console.log("Context create");
  },
  createElement: (tagName, attributes, ...childs: any[]) => {
    debugger;
    if (tagName instanceof Function) tagName();
    console.log("createElement", tagName.name || tagName);
  },
  endContext: () => {
    debugger;
    console.log("endContext");
  }
};

fidan(
  "div",
  null,
  fidan(fjsx.Context, {
    key: "theme",
    value: "tema1"
  }),
  fidan(Component1, null),
  fjsx.endContext()
);
