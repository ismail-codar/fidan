<div>
  list:
  {data.$val.map(function(item, index) {
    item = index % 2 ? item * 2 : item * 3;
    return item.$val + 2 == 0 ? <strong>{item.$val}</strong> : item.$val;
  })}
</div>;
