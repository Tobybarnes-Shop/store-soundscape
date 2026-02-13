'use client';

import Switch from './Switch';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <Switch
      checked={theme === 'dark'}
      onChange={onToggle}
      label="Theme"
      size="medium"
    />
  );
}
