import { StatefulListProps } from './index.d';
import { createOverrides, createSortable } from './dnd-list';

export const StatefulList = (props: StatefulListProps) => {
  const {
    initialState: { items },
    overrides,
  } = props;

  // TODO no computed
  const labelWithProps = createOverrides(
    _props => <li {..._props}>{_props.children}</li>,
    overrides
  );

  const { Label, labelProps } = labelWithProps;

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
