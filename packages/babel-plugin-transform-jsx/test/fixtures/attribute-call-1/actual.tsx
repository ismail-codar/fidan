function linkUrl(text$) {
	return '/' + text$;
}

const View = (props) => {
	const linkText$ = '';
	return <a href={linkUrl(linkText$)} />;
};
