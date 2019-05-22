import RouteRecognizer from "route-recognizer";
export const instance = new RouteRecognizer();

export const transitionTo = (path: string) => {
  let result = instance.recognize(path);
  if (result) {
    for (var i = 0; i < result.length; i++) {
      var item = result[i] as any;
      item.handler();
    }
    // window.location.hash = props.to;
    window.history.pushState(null, null, path);
  }
};

export const Router = (props: any) => {
  const childs: any[] = props.children;
  const routerParent = <div className="fidan-router-root" /> as HTMLDivElement;
  childs.forEach(child => {
    child["$routerParent"] = routerParent;
    routerParent.appendChild(child);
  });
  return routerParent;
};
