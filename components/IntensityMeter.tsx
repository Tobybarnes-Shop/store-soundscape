'use client';

interface IntensityMeterProps {
  intensity: number; // 0 to 1
}

export default function IntensityMeter({ intensity }: IntensityMeterProps) {
  const segments = 16;
  const filledSegments = Math.round(intensity * segments);

  return (
    <div className="te-panel p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="te-label">Activity</span>
        <div className="flex items-center gap-2">
          <div className={`te-led ${intensity > 0 ? 'green' : ''}`} />
        </div>
      </div>

      {/* LED Display */}
      <div className="te-display mb-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="te-display-text text-4xl font-bold tracking-tight">
            {Math.round(intensity * 100).toString().padStart(3, '0')}
          </span>
          <span className="te-display-text text-sm opacity-70">%</span>
        </div>
      </div>

      {/* Horizontal LED meter bar */}
      <div className="te-display p-3 mb-3">
        <div className="flex gap-[3px]">
          {Array.from({ length: segments }).map((_, i) => {
            const isFilled = i < filledSegments;
            const isHigh = i >= segments * 0.75;
            const isMid = i >= segments * 0.5 && i < segments * 0.75;

            let color = 'bg-[#0a0f0d]';
            if (isFilled) {
              if (isHigh) color = 'bg-[var(--accent)]';
              else if (isMid) color = 'bg-yellow-400';
              else color = 'bg-[var(--display-text)]';
            }

            return (
              <div
                key={i}
                className={`flex-1 h-4 rounded-sm transition-all duration-75 ${color} ${
                  isFilled ? 'meter-bar-active shadow-[0_0_4px_currentColor]' : ''
                }`}
                style={{
                  boxShadow: isFilled
                    ? isHigh
                      ? '0 0 6px var(--accent)'
                      : isMid
                      ? '0 0 6px #facc15'
                      : '0 0 6px var(--display-text)'
                    : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between px-1">
        <span className="te-label text-[8px]">Low</span>
        <span className="te-label text-[8px]">Med</span>
        <span className="te-label text-[8px]">High</span>
      </div>
    </div>
  );
}
