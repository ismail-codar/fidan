import React from 'react';
import { StatefulList } from './index';

const DndDemoApp = () => {
  return (
    <div>
      <StatefulList />
    </div>
  );
};
document.getElementById('main').appendChild(DndDemoApp() as any);
