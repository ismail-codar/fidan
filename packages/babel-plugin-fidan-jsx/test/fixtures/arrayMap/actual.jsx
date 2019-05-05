const data = value([]);

const template = (
  <ul>
    {data().map(item => (
      <li>{item}</li>
    ))}
  </ul>
);
