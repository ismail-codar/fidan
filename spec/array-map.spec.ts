import * as fidan from '../src/index';

const prettyhtml = require('@starptech/prettyhtml');
const { Document, Node, Text } = require('basichtml');
global['document'] = new Document();
global['Node'] = Node;

jasmine.getEnv().throwOnExpectationFailure(true);

// it('array map1', () => {
// 	const arr = fjsx.array([]);
// 	// arr([ 1 ]);

// 	arr.$val.push(1);

// 	const parentDom = document.createElement('div');
// 	fjsx.arrayMap(arr, parentDom, (item, idx) => {
// 		return fjsx.createElement('span', null, item);
// 	});

// 	expect(parentDom.outerHTML).toEqual(`<div><span>1</span></div>`);
// });

it('array map2', () => {
	const arr = fidan.array([]);
	arr([ 1 ]);
	expect(arr.$val[0]).toEqual(1);

	const parentDom = document.createElement('div');
	fidan.arrayMap(arr, parentDom, (item, idx) => {
		return fidan.createElement('span', null, item);
	});
	arr.$val.push(2, 3);

	expect(parentDom.outerHTML).toEqual(`<div><span>1</span><span>2</span><span>3</span></div>`);
});
