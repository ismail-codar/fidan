import { html } from '../html';
import { trkl } from '../trkl';

const name = trkl('ismail');

setTimeout(() => {
  name('codar');
}, 1000);

const app = html`
  <div>name: ${name}<br /></div>
`;

document.getElementById('main').appendChild(app);
