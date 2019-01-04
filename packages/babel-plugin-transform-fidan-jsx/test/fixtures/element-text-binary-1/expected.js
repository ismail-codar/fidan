fidan(fjsx.Fragment, null, function(element) {
  element = fjsx.createTextNode(element);
  fjsx.compute(
    function() {
      element.textContent =
        state.item1.$val * (state.item2.$val + state.item3.$val);
    },
    state.item1,
    state.item2,
    state.item3
  );
});
