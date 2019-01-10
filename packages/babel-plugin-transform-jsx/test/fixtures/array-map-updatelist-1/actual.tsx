export const ListView = (props) => {
	return (
		<ul>
			{props.data$.map((item$) => {
				return (
					<li>
						id:{item$.id}
						text:<strong>{item$.text$}</strong>
					</li>
				);
			})}
		</ul>
	);
};
