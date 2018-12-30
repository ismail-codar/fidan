export const Main = () => {
	const dv1: HTMLElement = null;

	const view = <div ref={dv1}>Main View</div>;
	console.log(dv1);
	return view;
};
