import * as fidan from '..';

export const countValue = (val, onChange) => {
  val = fidan.observable(val);
  return fidan.html`
    <div>${val}
  <button onclick="${() => {
    val(val() + 1);
    onChange(val());
  }}">countValue-val</button>
  </div>
  `;
};
