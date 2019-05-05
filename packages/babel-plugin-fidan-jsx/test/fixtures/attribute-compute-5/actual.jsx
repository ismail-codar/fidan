<div
  className={compute(() =>
    classNames(
      {
        editing: editing(),
        completed: completed()
      },
      highlight()
    )
  )}
>
  test
</div>;
