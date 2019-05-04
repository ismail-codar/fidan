type ExpandableElement = HTMLElement & { [key: string]: any };
type DelegatedEventHandler = (e: Event, model?: any) => any;

const eventRegistry = new Set();

function lookup(
  el: ExpandableElement,
  name: string
): [DelegatedEventHandler, any?] {
  let h = el[name],
    m = el.model,
    r,
    p;
  if (
    (h === undefined || (h.length > 1 && m === undefined)) &&
    (p = el.host || el.parentNode)
  )
    r = lookup(p, name);
  return [h !== undefined ? h : r && r[0], m || (r && r[1])];
}
function eventHandler(e: Event) {
  const node = (e.composedPath && e.composedPath()[0]) || e.target;
  const [handler, model] = lookup(node as ExpandableElement, `__${e.type}`);

  // reverse Shadow DOM retargetting
  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node
    });
  }
  return handler && handler(e, model);
}

export const delegateEvents = (eventNames: string[]) => {
  for (let i = 0, l = eventNames.length; i < l; i++) {
    const name = eventNames[i];
    if (!eventRegistry.has(name)) {
      eventRegistry.add(name);
      document.addEventListener(name, eventHandler);
    }
  }
};
