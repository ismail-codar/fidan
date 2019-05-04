var employee = {
    firstName$: fidan.value("joe"),
    lastName$: fidan.value("blow")
  },
  div = fidan.createElement("div", null, function _(element) {
    element = fidan.createTextNode(element);
    fidan.compute(
      function _2() {
        element.textContent =
          employee.firstName$.$val + " " + employee.lastName$.$val;
      },
      employee.firstName$,
      employee.lastName$
    );
  });
employee.firstName$("john");
