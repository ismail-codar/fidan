var editing$,
	completed$ = false,
	highlight$ = true;
<div
	className={classNames(
		{
			editing: editing$,
			completed: completed$
		},
		highlight$
	)}
>
	test
</div>;
