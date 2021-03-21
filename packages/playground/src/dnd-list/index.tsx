import Sortable from 'sortablejs';
import { StatefulListProps } from './index.d';

import { TRule } from 'fela';
import { getOverrides } from '../utils/overrides';

export const StatefulList = (props: StatefulListProps) => {
  const {
    initialState: { items },
    overrides,
  } = props;

  const labelStyle: TRule = (props: { size: number }) => ({
    fontSize: props.size,
    listStyle: 'none',
    padding: '20px',
    borderBottom: 'solid 1px',
    backgroundColor: 'white',
  });

  const [Label, labelProps] = getOverrides(
    _props => <li {..._props}>{_props.children}</li>,
    labelStyle,
    overrides.Label
  );

  const element = (
    <ul>
      {items.map(value => (
        <Label {...labelProps}>{value}</Label>
      ))}
    </ul>
  );

  Sortable.create(element.firstElementChild, {
    animation: 150,
  });

  return element as JSX.Element;
};
