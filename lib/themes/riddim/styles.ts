import { ThemeColors } from '../index';

// Light Mode: "Tropical Daytime" - Inspired by palm trees and bright orange Riddim text
// MUCH brighter - closer to reference image white background
export const RIDDIM_LIGHT: ThemeColors = {
  background: '#f5f5f0',        // Much brighter, closer to white (reference)
  foreground: '#1a3320',        // Deep green (palm tree green)
  accent: '#ff5722',            // BRIGHT coral orange (Riddim text)
  accentGreen: '#2d7a5a',       // Vibrant tropical green (brighter palm trees)
  surface: '#e8dcc0',           // Lighter tan (brighter case)
  surfaceRaised: '#f8f4ec',     // Very light sand
  border: '#d4c5a9',            // Lighter tan border
  muted: '#8a7d6b',             // Muted brown
  displayBg: '#2d7a5a',         // Vibrant tropical green
  displayText: '#0fdb8a',       // Bright green for displays/power bars
  buttonShadow: '#b8a888',       // Lighter shadow
};

// Dark Mode: "Dub Studio Night" - Warm vintage equipment with orange and green accents
// Late night recording session - WARM browns, not cold grays
export const RIDDIM_DARK: ThemeColors = {
  background: '#3a3530',        // Warmer gray with brown undertone
  foreground: '#e8e4d8',        // Light tan/cream
  accent: '#ff5722',            // BRIGHT orange accent - same as light mode
  accentGreen: '#0fdb8a',       // Bright green for power bars
  surface: '#4a453d',           // Warm gray (more brown)
  surfaceRaised: '#5a5448',     // Lighter warm panel
  border: '#6a6050',            // Warm border
  muted: '#7a7560',             // Warm muted
  displayBg: '#1a1a18',         // Deep black
  displayText: '#0fdb8a',       // Bright green display/power bars
  buttonShadow: '#1a1a18',      // Deep shadow
};
