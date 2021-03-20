import * as React from 'react';
import { Theme } from './theme';

type StyleOverride<T> =
  | React.CSSProperties
  | ((
      props: { $theme: Theme } & React.PropsWithChildren<T>
    ) => React.CSSProperties);

type ComponentOverride<T> = React.ComponentType<T>;

interface OverrideObject<T> {
  component?: ComponentOverride<T>;
  props?: any;
  style?: StyleOverride<T>;
}

export type Override<T> = OverrideObject<T> | React.ComponentType<T>;

export interface Overrides<T> {
  [key: string]: Override<T>;
}
