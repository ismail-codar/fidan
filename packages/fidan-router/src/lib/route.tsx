import { instance } from "./router";

export const Route = (props: {
  exact?: boolean;
  path: string;
  component: Element | ((props) => Element);
}) => {
  instance.add([
    {
      path: props.path,
      handler: () => {
        const viewParent = view["$routerParent"];
        if (viewParent) {
          //  activateContext(props["$context"]);
          const rendered =
            typeof props.component === "function"
              ? props.component(props)
              : props.component;
          //   deactivateContext(props["$context"]);
          if (viewParent.firstChild)
            viewParent.replaceChild(rendered, viewParent.firstChild);
          else viewParent.appendChild(rendered);
        }
      }
    }
  ]);

  const view = <></>;

  return view;
};
