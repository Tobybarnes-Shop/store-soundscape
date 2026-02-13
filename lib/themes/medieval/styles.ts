import { ThemeColors } from '../index';

// Light Mode: "Parchment & Daylight Stone"
// Late afternoon merchant's quarter - aged parchment, limestone, warm brass, honey wood
export const MEDIEVAL_LIGHT: ThemeColors = {
  background: '#f5f0e8',        // Aged parchment
  foreground: '#2d2520',        // Dark walnut ink
  accent: '#b8860b',            // Dark goldenrod (brass/gold)
  accentGreen: '#4a6741',       // Sage green (herbs/tapestries)
  surface: '#ebe4d8',           // Cream stone
  surfaceRaised: '#f8f4ec',     // Lighter parchment
  border: '#c9b899',            // Tan leather
  muted: '#8b7d6b',             // Dusty brown
  displayBg: '#2d2520',         // Dark wood
  displayText: '#d4af37',       // Rich gold
  buttonShadow: '#b5a689',      // Deep tan
};

// Dark Mode: "Medieval Manuscript" - Inspired by Quentin magazine illuminated manuscript
// Deep black with LUMINOUS gold and CRIMSON red - high drama
export const MEDIEVAL_DARK: ThemeColors = {
  background: '#0a0a08',        // Near black (manuscript background)
  foreground: '#f4e4c0',        // Pale gold/parchment text
  accent: '#f4c430',            // BRIGHTER luminous gold (glowing Quentin text)
  accentGreen: '#8b1a1a',       // Deep CRIMSON red (illuminated accents)
  surface: '#1a1410',           // Very dark brown
  surfaceRaised: '#2a2420',     // Slightly lighter
  border: '#3a3430',            // Dark border
  muted: '#6b5d50',             // Muted brown
  displayBg: '#0a0a08',         // Deep black
  displayText: '#f4c430',       // BRIGHT luminous gold display
  buttonShadow: '#0a0a08',      // Deep shadow
};
