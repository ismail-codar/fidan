<span>
  {computed(() => {
    return node.childsType() === "choice" ? (
      <span> | </span>
    ) : (
      <span> -> </span>
    );
  })}
</span>;
