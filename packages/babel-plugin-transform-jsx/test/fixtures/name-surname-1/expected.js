var employee = {
		firstName$: fidan.value('joe'),
		lastName$: fidan.value('blow')
	},
	div = fidan.createElement('div', null, function(element) {
		element = fidan.createTextNode(element);
		fidan.compute(
			function() {
				element.textContent = employee.firstName$.$val + ' ' + employee.lastName$.$val;
			},
			employee.firstName$,
			employee.lastName$
		);
	});
employee.firstName$('john');
