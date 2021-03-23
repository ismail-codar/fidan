import React from 'react';
import { StatefulList } from './index';

const DndDemoApp = () => {
  const LiComponent = (_props, children) => (
    <li onClick={() => alert(1)} {..._props}>
      {children}
    </li>
  );
  return (
    <div>
      <LiComponent style={{ color: 'red' }}>Test1</LiComponent>
      {/*    
      <a
        target="_blank"
        href="https://baseweb.design/guides/understanding-overrides#subcomponents"
      >
        Subcomponents
      </a>
      <StatefulList
        initialState={{
          items: ['Item 1', 'Item 2', 'Item 3'],
        }}
      />
      <hr />

      <a
        target="_blank"
        href="https://baseweb.design/guides/understanding-overrides#introducing-overrides"
      >
        Introducing Overrides
      </a>
      <StatefulList
        initialState={{
          items: ['Item 1', 'Item 2', 'Item 3'],
        }}
        overrides={{
          Label: {
            style: {
              color: '#892C21',
            },
            props: {
              'data-testid': 'dnd-list-label',
            },
          },
        }}
      />
      <hr />
   
      <a
        target="_blank"
        href="https://baseweb.design/guides/understanding-overrides#theme"
      >
        $theme
      </a>
      <StatefulList
        initialState={{
          items: ['Item 1', 'Item 2', 'Item 3'],
        }}
        overrides={{
          Label: {
            style: ({ $theme }) => ({
              color: $theme.colors.negative600,
            }),
          },
        }}
      />
      <hr />

      <a
        target="_blank"
        href="https://baseweb.design/guides/understanding-overrides#state-props"
      >
        State Props
      </a>
      <StatefulList
        initialState={{
          items: ['Item 1', 'Item 2', 'Item 3'],
        }}
        overrides={{
          Label: {
            style: ({ $theme, $isDragged }) => ({
              color: $isDragged
                ? $theme.colors.primary
                : $theme.colors.accent400,
            }),
          },
        }}
      />
      <hr /> */}
    </div>
  );
};
document.getElementById('main').appendChild(DndDemoApp());
