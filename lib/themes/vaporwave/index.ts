import { Theme } from '../index';
import { createVaporwaveVoices, startVaporwaveAmbient, stopVaporwaveAmbient } from './audio';
import { VAPORWAVE_MAPPINGS } from './mappings';
import { VAPORWAVE_LIGHT, VAPORWAVE_DARK } from './styles';

export const VAPORWAVE_THEME: Theme = {
  name: 'Vaporwave Mall',
  variant: 'vaporwave',
  colors: {
    light: VAPORWAVE_LIGHT,
    dark: VAPORWAVE_DARK,
  },
  audio: {
    createVoices: createVaporwaveVoices,
    mappings: VAPORWAVE_MAPPINGS,
    startAmbient: startVaporwaveAmbient,
    stopAmbient: stopVaporwaveAmbient,
  },
};
