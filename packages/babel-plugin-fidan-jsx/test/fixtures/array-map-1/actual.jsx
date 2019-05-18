const data = value([]);

const template = (
  <ul>
    start
    {data().map(item => (
      <li>{item}</li>
    ))}
    end
  </ul>
);
