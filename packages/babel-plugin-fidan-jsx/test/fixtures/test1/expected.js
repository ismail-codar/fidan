import * as fidan from '@fidanjs/runtime';

var box = fidan.html`${Box(
	{},
	fidan.html`${shouldShowAnswer(user)
		? fidan.html`${Answer(
				{
					value: fidan.value(false)
				},
				fidan.html`no`
			)}`
		: fidan.html`${Box.Comment({}, fidan.html`Text Content`)}`}`
)}`;
