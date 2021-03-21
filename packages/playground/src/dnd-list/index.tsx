import Sortable from 'sortablejs';
import { StatefulListProps } from './index.d';

export const StatefulList = (props: StatefulListProps) => {
  const { element } = props;

  var sortable = Sortable.create(element.firstElementChild, {
    animation: 150,
  });

  return element as JSX.Element;
};
