import { TRule } from 'fela';
import { Override } from '../types/overrides';
import { styles } from '../utils/fela';

export const getOverrides = (
  defaultComponent,
  defaultStyleRule: TRule,
  override: Override<any>
) => {
  const Component = override?.component || defaultComponent;
  const componentProps = {};

  // const style = styles.renderRule(labelStyle, { size: 12 });

  return [Component, componentProps];
};
