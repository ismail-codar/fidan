import Sortable from 'sortablejs';

export const StatefulList = () => {
  const el = (
    <ul>
      <li>item 1</li>
      <li>item 2</li>
      <li>item 3</li>
    </ul>
  );

  var sortable = Sortable.create(
    ((el as any) as HTMLElement).firstElementChild
  );

  return el;
};
