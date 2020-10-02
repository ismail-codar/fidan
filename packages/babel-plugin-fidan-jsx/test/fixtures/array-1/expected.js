import * as fidan from '@fidanjs/runtime';
var arr1 = fidan.value([]);
var arr2 = fidan.value(new Array());
var arr3 = fidan.value(null);
var arr4 = [];
arr1.push(1);
arr2.push(1);
arr3([]);
arr3.push(1);
arr4.push(1);
for (var i = 0; i < 10; i++) {
	arr1.push(i);
}
for (var key in document.body) {
	arr2.push(key);
}
while (i < 10) {
	i++;
	arr3.push(i);
}
var i = 1;
do {
	i++;
	arr1.push(i);
} while (i < 10);
const view = fidan.html`<div>arr1:
  <ul>${arr1.map((item) => fidan.html`<li>${item}</li>`)}</ul>arr2:
  <ul>${arr2.map((item) => fidan.html`<li>${item}</li>`)}</ul>arr3:
  <ul>${arr3.map((item) => fidan.html`<li>${item}</li>`)}</ul></div>`;
