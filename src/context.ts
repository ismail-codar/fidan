import { html } from './html';

const appContext: { [key: string]: any[] } = {};

export const startContext = (key: string, value: any) => {
  if (!appContext[key]) appContext[key] = [];
  appContext[key].push(value);
  return '';
};

export const getContextValue = (key: string) => {
  if (appContext[key]) return appContext[key][appContext[key].length - 1];
};

export const endContext = (key: string) => {
  appContext[key].pop();
  return '';
};

export const Context = (props: { key: string; value: any }, children?: any) => {
  return html`
    ${startContext(props.key, props.value)}${children}
  `;
};
