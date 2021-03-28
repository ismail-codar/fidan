import { TRule } from 'fela';
import merge from 'deepmerge';
import { Override } from '../types/overrides';
import { styles } from '../utils/fela';

export const getOverrides = (
  defaultComponent,
  style: TRule,
  override: Override<any> = {}
) => {
  const Component = override?.component || defaultComponent;
  const componentProps = {};

  if (override.style) {
    const styleOverride =
      typeof override.style === 'function'
        ? override.style(null)
        : override.style;
    merge(style, styleOverride);
  }

  if (override.props) {
  }

  const cssClasses = styles.renderRule(style, {});

  return [Component, componentProps];
};
