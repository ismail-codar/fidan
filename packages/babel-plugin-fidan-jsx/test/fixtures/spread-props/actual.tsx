export const createOverrides1 = defaultComponent => {
  return {
    Label1: defaultComponent,
    labelProps1: null,
  };
};

export const createOverrides2 = defaultComponent => {
  return [defaultComponent, null];
};

const { Label1, labelProps1 } = createOverrides1(_props => (
  <li {..._props}>{_props.children}</li>
));

const [Label2, labelProps2] = createOverrides2(_props => (
  <li {..._props}>{_props.children}</li>
));

const element = (
  <ul>
    <Label1 {...labelProps1}>Label1</Label1>
    <Label2 {...labelProps1}>Label2</Label2>
  </ul>
);
