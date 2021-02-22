import { html } from '../html';
import { Observable, trkl } from '../trkl';

const count: Observable<number> = trkl(0);

const decrement = () => {
  count(count() - 1);
};

const increment = () => {
  count(count() + 1);
};

let btnIncrement: HTMLButtonElement = null;

const app = html`
  <div>
    <button onclick="${decrement}">
      -
    </button>
    ${count}
    <button
      ref="${element => {
        btnIncrement = element;
      }}"
      onclick="${increment}"
    >
      +
    </button>
  </div>
`;

document.getElementById('main').appendChild(app);
