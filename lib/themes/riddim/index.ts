import { Theme } from '../index';
import { createRiddimVoices, startRiddimAmbient, stopRiddimAmbient } from './audio';
import { RIDDIM_MAPPINGS } from './mappings';
import { RIDDIM_LIGHT, RIDDIM_DARK } from './styles';

export const RIDDIM_THEME: Theme = {
  name: 'Riddim',
  variant: 'riddim',
  colors: {
    light: RIDDIM_LIGHT,
    dark: RIDDIM_DARK,
  },
  audio: {
    createVoices: createRiddimVoices,
    mappings: RIDDIM_MAPPINGS,
    startAmbient: startRiddimAmbient,
    stopAmbient: stopRiddimAmbient,
  },
};
