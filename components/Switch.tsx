'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Switch({
  checked,
  onChange,
  label,
  size = 'medium',
}: SwitchProps) {
  const sizeMap = {
    small: { width: 40, height: 20, toggle: 14 },
    medium: { width: 56, height: 28, toggle: 20 },
    large: { width: 72, height: 36, toggle: 28 },
  };

  const dimensions = sizeMap[size];

  const handleClick = () => {
    onChange(!checked);
    // Play click sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = checked ? 600 : 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.03);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        className="relative focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-opacity-50 rounded-full"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
        aria-label={label}
        role="switch"
        aria-checked={checked}
      >
        {/* Switch track */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-200"
          style={{
            background: checked
              ? 'linear-gradient(to bottom, rgba(100, 160, 100, 0.9), rgba(80, 140, 80, 0.95))'
              : 'linear-gradient(to bottom, rgba(140, 140, 140, 0.8), rgba(120, 120, 120, 0.85))',
            boxShadow: `
              inset 0 2px 4px rgba(0, 0, 0, 0.3),
              inset 0 -1px 2px rgba(255, 255, 255, 0.2),
              0 1px 2px rgba(0, 0, 0, 0.2)
            `,
          }}
        >
          {/* Inner track groove */}
          <div
            className="absolute inset-[3px] rounded-full"
            style={{
              background: checked
                ? 'linear-gradient(to bottom, rgba(60, 120, 60, 0.6), rgba(80, 140, 80, 0.7))'
                : 'linear-gradient(to bottom, rgba(100, 100, 100, 0.6), rgba(120, 120, 120, 0.7))',
              boxShadow: 'inset 0 2px 3px rgba(0, 0, 0, 0.4)',
            }}
          />
        </div>

        {/* Switch toggle */}
        <div
          className="absolute top-1/2 transition-all duration-200 ease-out"
          style={{
            width: dimensions.toggle,
            height: dimensions.toggle,
            left: checked
              ? `${dimensions.width - dimensions.toggle - 4}px`
              : '4px',
            transform: 'translateY(-50%)',
          }}
        >
          {/* Toggle button */}
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(240, 240, 240, 0.98) 0%,
                  rgba(220, 220, 220, 0.95) 50%,
                  rgba(180, 180, 180, 0.92) 100%
                )
              `,
              boxShadow: `
                0 2px 4px rgba(0, 0, 0, 0.3),
                0 1px 2px rgba(0, 0, 0, 0.2),
                inset 0 1px 2px rgba(255, 255, 255, 0.8),
                inset 0 -1px 1px rgba(0, 0, 0, 0.1)
              `,
            }}
          >
            {/* Highlight on top of toggle */}
            <div
              className="absolute top-[15%] left-[20%] right-[20%] h-[30%] rounded-full"
              style={{
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0))',
              }}
            />
          </div>
        </div>
      </button>
      {label && (
        <span className="te-label text-[8px]">{label}</span>
      )}
    </div>
  );
}
