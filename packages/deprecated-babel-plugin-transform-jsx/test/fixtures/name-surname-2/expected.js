var order$ = fidan.value(0),
  employee = {
    firstName$: fidan.value("joe"),
    lastName$: fidan.value("blow")
  },
  fullName = function fullName(e) {
    var name$ = e.firstName$;
    var space$ = fidan.value(" ");
    return order$.$val + ". " + name$.$val + space$.$val + e.lastName$.$val;
  },
  div = fidan.createElement("div", null, function _(element) {
    element = fidan.createTextNode(element);
    fidan.computed(
      function _2() {
        element.textContent = fullName(employee);
      },
      employee.firstName$,
      order$,
      employee.lastName$
    );
  });
employee.firstName$("john");
