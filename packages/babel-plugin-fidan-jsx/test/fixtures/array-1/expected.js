import * as fidan from '@fidanjs/runtime';
var arr1 = fidan.value([]);
var _$arr1 = arr1().slice(0);
var arr2 = fidan.value(new Array());
var _$arr2 = arr2().slice(0);
var arr3 = fidan.value(null);
var _$arr3 = arr3().slice(0);
var arr4 = [];

_$arr1.push(1);
arr1(_$arr1);

_$arr2.push(1);
arr2(_$arr1);

_$arr3 = [];
arr3(_$arr3);

_$arr3.push(1);
arr3(_$arr3);

arr4.push(1);

for (var i = 0; i < 10; i++) {
	_$arr1.push(i);
}
arr1(_$arr1);

for (var key in document.body) {
	_$arr2.push(key);
}
arr2(_$arr2);

while (i < 10) {
	i++;
	_$arr3.push(i);
}
arr3(_$arr3);

var i = 1;

do {
	i++;
	arr1.push(i);
} while (i < 10);

const view = fidan.html`<div>arr1:
  <ul>${arr1.map((item) => fidan.html`<li>${item}</li>`)}</ul>arr2:
  <ul>${arr2.map((item) => fidan.html`<li>${item}</li>`)}</ul>arr3:
  <ul>${arr3.map((item) => fidan.html`<li>${item}</li>`)}</ul></div>`;
