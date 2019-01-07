import fidan from '@fidanjs/runtime';
fidan;

var x$ = 0;
const Main = () => {
	return <div>main {x$}</div>;
};

setInterval(() => {
	x$++;
}, 1000);

const main = <Main />;
document.getElementById('main').appendChild(main);
