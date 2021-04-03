import { html } from './html';

const appContext: any = {};

export const startContext = (key: string, value: any) => {
  if (!appContext[key]) appContext[key] = [];
  appContext[key].push(value);
  return '';
};

export const contextValue = <T>(key: keyof T): T[typeof key] => {
  if (appContext[key]) return appContext[key][appContext[key].length - 1];
};

export const endContext = (key: string) => {
  appContext[key].pop();
  return '';
};

export const Context = (
  props: { key: string; value: any; children?: any },
  children?: () => any
): any => {
  return html`
    ${startContext(props.key, props.value)}${children()}${endContext(props.key)}
  `;
};
