'use client';

interface IntensityMeterProps {
  intensity: number; // 0 to 1
}

export default function IntensityMeter({ intensity }: IntensityMeterProps) {
  const segments = 12;
  const filledSegments = Math.round(intensity * segments);

  return (
    <div className="te-panel p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="te-label">Activity</span>
        <span className="text-xs font-mono text-[var(--muted)]">
          {Math.round(intensity * 100).toString().padStart(3, '0')}%
        </span>
      </div>

      {/* Large numeric display */}
      <div className="text-center mb-6">
        <div className="te-value text-5xl text-[var(--accent)]">
          {Math.round(intensity * 100)}
        </div>
      </div>

      {/* Horizontal bar meter */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filledSegments;
          const isHigh = i >= segments * 0.75;
          const isMid = i >= segments * 0.5 && i < segments * 0.75;

          return (
            <div
              key={i}
              className={`flex-1 h-3 transition-all duration-100 ${
                isFilled
                  ? isHigh
                    ? 'bg-red-500'
                    : isMid
                    ? 'bg-yellow-500'
                    : 'bg-[var(--accent)]'
                  : 'bg-[var(--border)]'
              } ${isFilled ? 'meter-bar-active' : ''}`}
            />
          );
        })}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between">
        <span className="te-label">Low</span>
        <span className="te-label">High</span>
      </div>
    </div>
  );
}
