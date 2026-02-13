'use client';

import { ThemeVariant } from '@/lib/themes';
import Dial from './Dial';

interface ThemeDialProps {
  value: ThemeVariant;
  onChange: (theme: ThemeVariant) => void;
}

const THEMES: ThemeVariant[] = ['default', 'medieval', 'riddim'];
const THEME_LABELS = ['Default', 'Medieval', 'Riddim'];

export default function ThemeDial({ value, onChange }: ThemeDialProps) {
  const currentIndex = THEMES.indexOf(value);

  const handleDialChange = (dialValue: number) => {
    // Map dial value (0-1) to theme index (0-2)
    const index = Math.round(dialValue * 2);
    const clampedIndex = Math.max(0, Math.min(2, index));
    onChange(THEMES[clampedIndex]);
  };

  // Convert theme index to dial value (0-1)
  const dialValue = currentIndex / 2;

  return (
    <div className="te-panel p-3 flex items-center gap-4">
      <Dial
        value={dialValue}
        onChange={handleDialChange}
        label="Theme"
        size={64}
        steps={3}
      />
      <div className="flex flex-col gap-1">
        {THEME_LABELS.map((label, index) => (
          <div
            key={label}
            className={`text-[8px] uppercase font-bold transition-colors ${
              currentIndex === index
                ? 'text-[var(--accent)]'
                : 'text-[var(--muted)]'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
