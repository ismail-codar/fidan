// https://github.com/ismail-codar/fjsx/blob/master/packages/fjsx-examples/examples/context/_.demo.tsx
import { Context, contextValue } from '../src/context';
import { html } from '../src/html';

interface AppContext {
  theme: string;
}

const themes = {
  dark: {
    button: {
      backgroundColor: 'black',
      color: 'white',
    },
  },
  light: {
    button: {
      backgroundColor: 'lightblue',
      color: 'navy',
    },
  },
};

const Button = (props, children?) => {
  const themeName = contextValue<AppContext>('theme');
  const theme = themes[themeName];
  return html`
    <button style="${theme?.button}">
      ${children}
    </button>
  `;
};

const Component1 = (props, children?) => {
  return html`
    <div>
      ${Button(
        {},
        html`
          button 1
        `
      )}${Button(
        {},
        html`
          button 2
        `
      )}
    </div>
  `;
};

const App = () => html`
  <div>
    ${Component1({})}${Context(
      {
        key: 'theme',
        value: 'dark',
      },
      () => html`
        ${Component1({})}${Context(
          {
            key: 'theme',
            value: 'light',
          },
          () => html`
            ${Component1({})}
          `
        )}${Component1({})}
      `
    )}${Component1({})}
  </div>
`;

// const App = () => html`
//   <div>
//     ${Context(
//       {
//         key: 'theme',
//         value: 'dark',
//       },
//       () => html`
//         ${Component1({})}
//       `
//     )}
//   </div>
// `;

document.getElementById('main').appendChild(App());
