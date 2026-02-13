import { Theme } from '../index';
import { createMedievalVoices } from './audio';
import { MEDIEVAL_MAPPINGS } from './mappings';
import { MEDIEVAL_LIGHT, MEDIEVAL_DARK } from './styles';

export const MEDIEVAL_THEME: Theme = {
  name: 'Medieval',
  variant: 'medieval',
  colors: {
    light: MEDIEVAL_LIGHT,
    dark: MEDIEVAL_DARK,
  },
  audio: {
    createVoices: createMedievalVoices,
    mappings: MEDIEVAL_MAPPINGS,
  },
};
