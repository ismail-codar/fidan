<button
  className={cssRule({
    fontSize: `${primary$}pt`,
    textAlign: "center",
    padding: "5px 10px",
    background: primary$ ? "green" : "blue",
    borderRadius: 5,
    ":hover": {
      background: primary$ ? "chartreuse" : "dodgerblue",
      boxShadow: "0 0 2px rgb(70, 70, 70)"
    }
  })}
>
  button 1
</button>;
