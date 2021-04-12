/* eslint-disable prefer-destructuring */
import { start } from '@storybook/core/client';

import './globals';
import render from './render';
import { ClientApi } from './types';

const framework = 'fidanjs';
const api = start(render);

export const storiesOf: ClientApi['storiesOf'] = (kind, m) => {
  return (api.clientApi.storiesOf(kind, m) as ReturnType<
    ClientApi['storiesOf']
  >).addParameters({
    framework,
  });
};

export const configure: ClientApi['configure'] = (...args) =>
  api.configure(framework, ...args);
export const addDecorator = api.clientApi.addDecorator;
export const addParameters = api.clientApi.addParameters;
export const clearDecorators: ClientApi['clearDecorators'] =
  api.clientApi.clearDecorators;
export const setAddon: ClientApi['setAddon'] = api.clientApi.setAddon;
export const forceReRender: ClientApi['forceReRender'] = api.forceReRender;
export const getStorybook: ClientApi['getStorybook'] =
  api.clientApi.getStorybook;
export const raw: ClientApi['raw'] = api.clientApi.raw;
