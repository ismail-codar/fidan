import { StatefulListProps } from './index.d';
import { createOverrides, createSortable } from './dnd-list';
import { getOverrides } from '../utils/overrides';

export const StatefulList = (props: StatefulListProps) => {
  const {
    initialState: { items },
    overrides,
  } = props;

  const { Label, labelProps } = createOverrides(
    _props => <li {..._props}>{_props.children}</li>,
    overrides
  );

  const [Label1, labelProps1] = getOverrides(null, null, null);

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
