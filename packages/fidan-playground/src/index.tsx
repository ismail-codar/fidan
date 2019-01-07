import '@fidanjs/runtime';

var x$ = 0;
const Main = () => {
	return <div>main {x$}</div>;
};

setInterval(() => {
	x$++;
}, 1000);

const main = <Main />;
document.getElementById('main').appendChild(main);
