<div
  className={computed(() =>
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
