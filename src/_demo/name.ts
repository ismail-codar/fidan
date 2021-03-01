import { html } from '../html';
import { frvl } from '../frvl';

const name = frvl('ismail');

setTimeout(() => {
  name('codar');
}, 1000);

const app = html`
  <div>name: ${name}<br /></div>
`;

document.getElementById('main').appendChild(app);
