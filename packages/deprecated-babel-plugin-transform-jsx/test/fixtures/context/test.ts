//fidan.Context createElement i bul
//arguments.push(fidan.endContext())

const Component1 = () => {
	console.log('Component1');
	return null;
};
const fidan = {
	Context: () => {
		debugger;
		console.log('Context create');
	},
	createElement: (tagName, attributes, ...childs: any[]) => {
		debugger;
		if (tagName instanceof Function) tagName();
		console.log('createElement', tagName.name || tagName);
	},
	endContext: () => {
		debugger;
		console.log('endContext');
	}
};

fidan.createElement(
	'div',
	null,
	fidan.createElement(fidan.Context, {
		key: 'theme',
		value: 'tema1'
	}),
	fidan.createElement(Component1, null),
	fidan.endContext()
);
