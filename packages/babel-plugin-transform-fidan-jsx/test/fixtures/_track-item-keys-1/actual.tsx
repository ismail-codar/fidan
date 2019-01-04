interface IData {
  id?: number;
  title: string;
  date?: Date;
}

// @tracked @track_keys id|title
var list: IData[] = [{ title: "a" }, { title: "b" }, { title: "c" }];
list.push({ title: "d" });

var ul1 = (
  <ul>
    {list.map((
      // @track_keys id|title
      item
    ) => <li>{item.title}</li>)}
  </ul>
);
