const data = value([]);

const template = (
  <ul {...jsx1.jsxArrayMap(data, item => <li>{item}</li>, "reconcile")} />
);
