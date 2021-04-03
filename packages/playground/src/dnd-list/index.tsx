import { StatefulListProps } from './types';
import { createDndLabelOverrides, createSortable } from './dnd-list';

export const StatefulList = (props: StatefulListProps) => {
  const {
    initialState: { items },
    overrides,
  } = props;

  const { Label, labelProps } = createDndLabelOverrides((_props, _children) => {
    return <li {..._props}>{_children()}</li>;
  }, overrides);

  const element = (
    <ul>
      {items.map(value => (
        <Label {...labelProps}>{value}</Label>
      ))}
    </ul>
  );

  createSortable(element);

  return element as JSX.Element;
};
