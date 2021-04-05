import { TRule } from 'fela';
import merge from 'deepmerge';
import { Override } from '../types/overrides';
import { styles } from '../utils/fela';
import {
  computed,
  contextValue,
  observable,
  Observable,
} from '@fidanjs/runtime';

export const getOverrides = (
  defaultComponent,
  style: TRule,
  override: Override<any> = {}
) => {
  const Component = override?.component || defaultComponent;
  const componentProps = { className: '' };
  const theme: Observable<any> = contextValue('theme');
  let overrideProps = { $theme: null, $isDragging: false };
  // TODO $isDragging (state-props)

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

  const renderClassName = props => {
    overrideProps = { ...overrideProps, ...props };
    const cssClasses = styles.renderRule(renderStyle, overrideProps);
    componentProps.className += (' ' + cssClasses).trim();
  };

  renderClassName({ $theme: theme() });
  theme.subscribe($theme => {
    renderClassName({ $theme });
  });
  //computed(() => {});

  return [Component, componentProps, renderClassName];
};
