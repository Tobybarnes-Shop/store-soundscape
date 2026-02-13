'use client';

import Switch from './Switch';
import { ColorMode } from '@/lib/themes';

interface ColorModeSwitchProps {
  mode: ColorMode;
  onToggle: () => void;
}

export default function ColorModeSwitch({ mode, onToggle }: ColorModeSwitchProps) {
  return (
    <Switch
      checked={mode === 'dark'}
      onChange={onToggle}
      size="medium"
    />
  );
}
