const GraphLink = props => {
  if (props.source.x === undefined) return null;
  const propX1 = value(props.source.x);
  const propY1 = value(props.source.y);
  const propX2 = value(props.target.x);
  const propY2 = value(props.target.y);
  injectToProperty(props.source, "x", propX1);
  injectToProperty(props.source, "y", propY1);
  injectToProperty(props.target, "x", propX2);
  injectToProperty(props.target, "y", propY2);
  return (
    <line
      className="link"
      x1={propX1()}
      y1={propY1()}
      x2={propX2()}
      y2={propY2()}
    />
  );
};
