import * as fidan from '@fidanjs/runtime';

const APP = () => {
  let counter = 0;

  return (
    <div>
      {counter}
      <button
        onClick={() => {
          counter++;
        }}
      >
        +
      </button>
    </div>
  );
};

document.getElementById('main').appendChild(APP());
