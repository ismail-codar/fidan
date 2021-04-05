import { TRule } from 'fela';
import Sortable from 'sortablejs';
import { Theme } from '../types/theme';
import { getOverrides } from '../utils/overrides';
import { ListOverrides } from './types';

export const createSortable = (
  element: HTMLElement,
  onChange: (evt) => void
) => {
  Sortable.create(element.firstElementChild, {
    animation: 150,
    onChange,
  });
};

export const createDndLabelOverrides = (
  defaultComponent,
  overrides: ListOverrides
) => {
  const labelStyle: TRule = (props: { $theme: Theme }) => ({
    listStyle: 'none',
    padding: '20px',
    borderBottom: 'solid 1px',
    backgroundColor: 'white',
    fontWeight: 'bold',
  });

  const [Label, labelProps, labelRenderClassName] = getOverrides(
    defaultComponent,
    labelStyle,
    overrides?.Label
  );

  return { Label, labelProps, labelRenderClassName };
};
