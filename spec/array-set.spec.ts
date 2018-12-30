import * as fjsx from '../src/index';

const prettyhtml = require('@starptech/prettyhtml');
const { Document, Node, Text } = require('basichtml');
global['document'] = new Document();
global['Node'] = Node;

jasmine.getEnv().throwOnExpectationFailure(true);

it('array value set', () => {
	const added = [];
	const arr = fjsx.array([]);

	arr.on('itemadded', (e) => {
		added.push(e);
	});

	const parentDom = document.createElement('div');
	fjsx.arrayMap(arr, parentDom, (item, idx) => {
		return fjsx.createElement('span', null, item);
	});

	arr.$val.push(1);
	expect(parentDom.outerHTML).toEqual(`<div><span>1</span></div>`);
	arr([]);
	arr.$val.push(2);
	expect(parentDom.outerHTML).toEqual(`<div><span>2</span></div>`);

	expect(
		JSON.stringify([ { type: 'itemadded', index: 0, item: 1 }, { type: 'itemadded', index: 0, item: 2 } ])
	).toEqual(JSON.stringify(added));
});
