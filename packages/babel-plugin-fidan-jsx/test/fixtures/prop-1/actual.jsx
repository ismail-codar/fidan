const Component = (props) => {
	const { value, text } = props;
	console.log(text);
	return <span>{value}</span>;
};
