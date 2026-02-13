import { Voices } from '../audio/voices';
import { EventSoundMapping } from '../audio/mappings';

export type ThemeVariant = 'default' | 'medieval' | 'riddim' | 'vaporwave';
export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  foreground: string;
  accent: string;
  accentGreen: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  muted: string;
  displayBg: string;
  displayText: string;
  buttonShadow: string;
}

export interface ThemeAudio {
  createVoices: () => Voices;
  mappings: EventSoundMapping[];
  startAmbient?: () => void;    // Optional: Start ambient/loop sounds
  stopAmbient?: () => void;     // Optional: Stop ambient/loop sounds
}

export interface Theme {
  name: string;
  variant: ThemeVariant;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  audio: ThemeAudio;
}

// Import all themes
import { DEFAULT_THEME } from './default';
import { MEDIEVAL_THEME } from './medieval';
import { RIDDIM_THEME } from './riddim';
import { VAPORWAVE_THEME } from './vaporwave';

// Theme registry
export const THEMES: Record<ThemeVariant, Theme> = {
  default: DEFAULT_THEME,
  medieval: MEDIEVAL_THEME,
  riddim: RIDDIM_THEME,
  vaporwave: VAPORWAVE_THEME,
};

// Helper to get a theme safely
export function getTheme(variant: ThemeVariant): Theme {
  const theme = THEMES[variant];
  if (!theme) {
    throw new Error(`Theme "${variant}" not found. Available themes: ${Object.keys(THEMES).join(', ')}`);
  }
  return theme;
}

// Apply CSS variables for a theme + mode combination
export function applyThemeStyles(variant: ThemeVariant, mode: ColorMode): void {
  const theme = getTheme(variant);
  const colors = theme.colors[mode];

  document.documentElement.setAttribute('data-theme', variant);
  document.documentElement.setAttribute('data-mode', mode);

  // Also set CSS variables directly for immediate access
  const root = document.documentElement;
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.foreground);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-green', colors.accentGreen);
  root.style.setProperty('--surface', colors.surface);
  root.style.setProperty('--surface-raised', colors.surfaceRaised);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--muted', colors.muted);
  root.style.setProperty('--display-bg', colors.displayBg);
  root.style.setProperty('--display-text', colors.displayText);
  root.style.setProperty('--button-shadow', colors.buttonShadow);
}
