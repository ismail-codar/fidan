var employee = {
    firstName$: fjsx.value("joe"),
    lastName$: fjsx.value("blow")
  },
  div = fidan("div", null, function(element) {
    element = fjsx.createTextNode(element);
    fjsx.compute(
      function() {
        element.textContent =
          employee.firstName$.$val + " " + employee.lastName$.$val;
      },
      employee.firstName$,
      employee.lastName$
    );
  });
employee.firstName$("john");
