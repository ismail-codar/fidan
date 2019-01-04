var order$ = fjsx.value(0),
  employee = {
    firstName$: fjsx.value("joe"),
    lastName$: fjsx.value("blow")
  },
  fullName = function fullName(e) {
    var name$ = e.firstName$;
    var space$ = fjsx.value(" ");
    return order$.$val + ". " + name$.$val + space$.$val + e.lastName$.$val;
  },
  div = fidan("div", null, function(element) {
    element = fjsx.createTextNode(element);
    fjsx.compute(
      function() {
        element.textContent = fullName(employee);
      },
      employee.firstName$,
      order$,
      employee.lastName$
    );
  });
employee.firstName$("john");
