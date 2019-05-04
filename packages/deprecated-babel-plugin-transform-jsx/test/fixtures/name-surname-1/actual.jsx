const employee = { firstName$: "joe", lastName$: "blow" },
  div = <div>{employee.firstName$ + " " + employee.lastName$}</div>;
employee.firstName$ = "john";
