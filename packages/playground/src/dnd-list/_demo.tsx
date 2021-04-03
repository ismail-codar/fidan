import * as fidan from '@fidanjs/runtime';
import { Theme } from '../types/theme';
import { StatefulList } from './index';
import { currentTheme } from './theme';

const DndDemoApp = () => {
  return (
    <div>
      {/* <a
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
              color: 'red',
            },
            props: {
              'data-testid': 'dnd-list-label',
            },
          },
        }}
      /> */}
      <hr />
      <fidan.Context key="theme" value={currentTheme}>
        {/* <a
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
        <hr /> */}

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
      </fidan.Context>
      <hr />
    </div>
  );
};
document.getElementById('main').appendChild(DndDemoApp());
