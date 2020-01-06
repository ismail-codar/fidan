const GraphNode = props => {
  if (!props.x) return null;
  const propX = value(props.x);
  const propY = value(props.y);

  injectToProperty(props, "x", propX);
  injectToProperty(props, "y", propY);

  computed(() => {
    console.log(propX(), propY());
  });

  return (
    <g>
      <rect
        className="node"
        width={100}
        height="40"
        rx="5"
        ry="5"
        x={computed(() => propX() - props.width / 2)}
        y={computed(() => propY() - props.height / 2)}
      >
        <title>{props.name}</title>
      </rect>
      <text className="label" x={propX()} y={computed(() => propY() + 10)}>
        {props.name}
      </text>
    </g>
  );
};
