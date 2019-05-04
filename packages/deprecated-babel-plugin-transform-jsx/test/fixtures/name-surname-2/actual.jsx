const order$ = 0,
  employee = { firstName$: "joe", lastName$: "blow" },
  fullName = e => {
    var name$ = e.firstName$;
    var space$ = " ";
    return order$ + ". " + name$ + space$ + e.lastName$;
  },
  div = <div>{fullName(employee)}</div>;
employee.firstName$ = "john";
