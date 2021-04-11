import { TransformOptions } from '@babel/core';

export function babelDefault(config: TransformOptions) {
  return {
    ...config,
    presets: [...(config.presets as any), 'fidanjs'],
  };
}
