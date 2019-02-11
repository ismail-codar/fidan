# fidan
High performance and easy way for building web user interfaces.

##A counter example:

```jsx
var counter$ = 0; // An option: If a variable ends with $ then it is observable.

var view = (
  <>
    <button onClick={() => counter$++}> + </button>
    {counter$}
    <button onClick={() => counter$--}> - </button>
  </>
); // Bonus! view is a real DOM element(s)

document.body.appendChild(view);
```

## API

TODO

## Acknowledgement

Some ideas are inspired from [surplus](https://github.com/adamhaile/surplus)
