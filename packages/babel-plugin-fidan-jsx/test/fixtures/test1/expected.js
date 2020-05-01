var box = html`${Box(
	{},
	html`${shouldShowAnswer(user)
		? html`${Answer(
				{
					value: false
				},
				html`no`
			)}`
		: html`${Box.Comment({}, html`Text Content`)}`}`
)}`;
