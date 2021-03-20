import Sortable from 'sortablejs';
import { styles } from '../utils/fela';

export const StatefulList = () => {
  const rule = props => ({
    backgroundColor: 'red',
    fontSize: 14,
    color: 'blue',
  });

  const liStyle = styles.renderRule(rule, { size: 12 });

  const el = (
    <ul>
      {[1, 2, 3, 4].map(item => (
        <li className={liStyle}>item {item}</li>
      ))}
    </ul>
  );

  var sortable = Sortable.create(
    ((el as any) as HTMLElement).firstElementChild
  );

  return el;
};
