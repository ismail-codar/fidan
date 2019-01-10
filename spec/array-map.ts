import { fidan } from '../src/index';
import { insertToDom } from '../src/dom';
import { FidanValue } from '../src/f';
import { arrayMapWithClone } from '../src/experimental/array-map';
const prettyhtml = require('@starptech/prettyhtml');
const { Document, Node, Text } = require('basichtml');

global['document'] = new Document();
global['Node'] = Node;

interface IDataRow {
	id: number;
	label$: FidanValue<string>;
}

const state = {
	selected$: fidan.value(1),
	data$: fidan.array<IDataRow>([
		{
			id: 1,
			label$: fidan.value('One')
		},
		{
			id: 2,
			label$: fidan.value('Two')
		}
	])
};
const handlers = {
	select(id) {},
	delete_(id) {}
};

var table1 = fidan.createElement('div', null, function(element) {
	fidan.arrayMap(state.data$ as any, element, function(d: IDataRow, i: number) {
		return fidan.createElement('span', {}, function(element) {
			element = fidan.createTextNode(element);
			fidan.compute(function() {
				element.textContent = d.label$.$val;
			}, d.label$);
		});
	});
});

var table2 = fidan.createElement('div', null, function(element) {
	const updateList = [];
	updateList.push({
		path: [ 0 ],
		fn: function(element, dataItem, i) {
			fidan.compute(function() {
				element.textContent = dataItem.label$.$val;
			}, dataItem.label$);
		}
	});
	const renderTemplate = (i) => fidan.createElement('span', {}, state.data$.$val[i]);
	arrayMapWithClone(state.data$ as any, element, renderTemplate, updateList);
});

const html = (table2 as HTMLTableElement).outerHTML;
console.log(prettyhtml(html).contents);
