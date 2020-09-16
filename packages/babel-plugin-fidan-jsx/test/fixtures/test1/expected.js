import { fidan } from '@fidanjs/runtime';

var box = fidan.html`${Box(
	{},
	html`${shouldShowAnswer(user)
		? fidan.html`${Answer(
				{
					value: false
				},
				fidan.html`no`
			)}`
		: fidan.html`${Box.Comment({}, fidan.html`Text Content`)}`}`
)}`;
