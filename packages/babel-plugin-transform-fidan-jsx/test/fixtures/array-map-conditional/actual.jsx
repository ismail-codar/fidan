<div>
  list:
  {props.data.$val.map((item, index) => {
    return item.$val % 2 == 0 ? item.$val : <strong>item:{item.$val}</strong>;
  })}
</div>;
