import { instance } from "./router";

const insertToDom = (viewParent, rendered) => {
  if (viewParent.firstChild)
  viewParent.replaceChild(rendered, viewParent.firstChild);
else viewParent.appendChild(rendered);
}

export const Route = (props: {
  exact?: boolean;
  path: string;
  component: any | ((props) => any);
}) => {
  instance.add([
    {
      path: props.path,
      handler: () => {
        const viewParent = view["$routerParent"];
        if (viewParent) {
          //  activateContext(props["$context"]);
          let rendered =
            typeof props.component === "function"
              ? props.component(props)
              : props.component;
          //   deactivateContext(props["$context"]);
          if (rendered instanceof Promise) {
            rendered.then(_rendered => {
              insertToDom(viewParent,_rendered)
            })
          } else {
            insertToDom(viewParent,rendered)
          }
        }
      }
    }
  ]);

  const view = <></>;

  return view;
};
