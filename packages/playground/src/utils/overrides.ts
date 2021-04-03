import { TRule } from 'fela';
import merge from 'deepmerge';
import { Override } from '../types/overrides';
import { styles } from '../utils/fela';
import { contextValue } from '@fidanjs/runtime';

export const getOverrides = (
  defaultComponent,
  style: TRule,
  override: Override<any> = {}
) => {
  const Component = override?.component || defaultComponent;
  const componentProps = { className: '' };
  const $theme = contextValue('theme')();
  // TODO $isDragging (state-props)
  const $isDragging = false;

  let renderStyle = style;
  if (override.style) {
    renderStyle = arg => {
      const styleOverride = (typeof override.style === 'function'
        ? override.style
        : () => override.style) as TRule;
      return merge(
        style(arg, undefined) as any,
        styleOverride(arg, undefined) as any
      );
    };
  }

  if (override.props) {
  }

  const cssClasses = styles.renderRule(renderStyle, { $theme, $isDragging });
  componentProps.className += (' ' + cssClasses).trim();

  return [Component, componentProps];
};
