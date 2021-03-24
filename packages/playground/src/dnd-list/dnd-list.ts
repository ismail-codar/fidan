import { TRule } from 'fela';
import Sortable from 'sortablejs';
import { getOverrides } from '../utils/overrides';

export const createSortable = (element: HTMLElement) => {
  Sortable.create(element.firstElementChild, {
    animation: 150,
  });
};

export const createOverrides = (defaultComponent, overrides) => {
  const labelStyle: TRule = (props: { size: number }) => ({
    fontSize: props.size,
    listStyle: 'none',
    padding: '20px',
    borderBottom: 'solid 1px',
    backgroundColor: 'white',
  });

  const [Label, labelProps] = getOverrides(
    defaultComponent,
    labelStyle,
    overrides?.Label
  );

  return { Label, labelProps };
};
