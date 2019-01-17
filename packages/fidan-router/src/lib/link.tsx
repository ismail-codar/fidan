import '@fidanjs/runtime';
import { transitionTo } from './router';

export const Link = (props: { to: string; children: any }) => {
	const handleLinkClick: Fidan.MouseEventHandler<HTMLAnchorElement> = (e) => {
		e.preventDefault();
		transitionTo(props.to);
	};

	return (
		<a onClick={handleLinkClick} href={props.to}>
			{props.children}
		</a>
	);
};
