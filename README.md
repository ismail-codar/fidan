# fidan

High performance and easy way for building web user interfaces.

## A counter example:

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

The above example can work because our [compiler](./packages/babel-plugin-transform-jsx) compiles to knockout style observable functions.

## Template literals based examples

> It can be works directly in the browsers. There is no additional bundler or any compiler required

- [Basic Crud](https://codesandbox.io/s/jnj869m5zy)

## Bundler based examples

- [Starter Kit](https://github.com/ismail-codar/fidan-starter)

## API

TODO

## Acknowledgement

Some ideas are inspired from [surplus](https://github.com/adamhaile/surplus)
