import React from 'react';
import { StatefulList } from './index';
import { TRule } from 'fela';
import { styles } from '../utils/fela';

const DndDemoApp = () => {
  const rule: TRule = (props: { size: number }) => ({
    fontSize: props.size,
    color: 'blue',
    listStyle: 'none',
    padding: '20px',
    borderBottom: 'solid 1px',
    backgroundColor: 'white',
  });

  const liStyle = styles.renderRule(rule, { size: 12 });

  const el = (
    <ul>
      {[1, 2, 3, 4].map(item => (
        <li className={liStyle}>item {item}</li>
      ))}
    </ul>
  );

  return (
    <div>
      <StatefulList element={el} overrides={{}} />
    </div>
  );
};
document.getElementById('main').appendChild(DndDemoApp());
