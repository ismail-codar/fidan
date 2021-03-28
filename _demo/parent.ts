import { html } from '../src/html';

const LiComponent = (props, children) =>
  html`
    <li>1</li>
  `;

const App = () => {
  var cmp = LiComponent({}, '1');
  //   return html`
  //     <span>${cmp}</span>
  //   `;
  return html`
    ${cmp}
  `;
};
document.getElementById('main').appendChild(App());
