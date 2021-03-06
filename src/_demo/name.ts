import { html } from '../html';
import { value } from '../value';

const name = value('ismail');

setTimeout(() => {
  name('codar');
}, 1000);

const app = html`
  <div>name: ${name}<br /></div>
`;

document.getElementById('main').appendChild(app);
