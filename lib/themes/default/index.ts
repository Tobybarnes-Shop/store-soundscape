import { Theme } from '../index';
import { createDefaultVoices } from './audio';
import { DEFAULT_MAPPINGS } from './mappings';
import { DEFAULT_LIGHT, DEFAULT_DARK } from './styles';

export const DEFAULT_THEME: Theme = {
  name: 'Default',
  variant: 'default',
  colors: {
    light: DEFAULT_LIGHT,
    dark: DEFAULT_DARK,
  },
  audio: {
    createVoices: createDefaultVoices,
    mappings: DEFAULT_MAPPINGS,
  },
};
