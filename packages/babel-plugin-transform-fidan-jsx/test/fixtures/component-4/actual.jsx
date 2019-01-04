import { ProgressCircular } from '../../components/vue/vuetify/VProgressCircular/ProgressCircular';

export const Main = () => {
	let value$ = 10;
	return (
		<div>
			<ProgressCircular value$={value$} />
		</div>
	);
};
