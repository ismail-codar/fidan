import { html } from '../html';
import { observable } from '../observable';

const name = observable('ismail');

setTimeout(() => {
  name('codar');
}, 1000);

const app = html`
  <div>name: ${name}<br /></div>
`;

document.getElementById('main').appendChild(app);
