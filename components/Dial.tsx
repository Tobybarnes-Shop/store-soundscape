'use client';

import { useRef, useState, useEffect } from 'react';

interface DialProps {
  value: number; // 0-1 range
  onChange: (value: number) => void;
  label?: string;
  size?: number;
  min?: number;
  max?: number;
  steps?: number; // Number of discrete positions
}

export default function Dial({
  value,
  onChange,
  label,
  size = 80,
  min = 0,
  max = 1,
  steps = 17, // Match the number of tick marks
}: DialProps) {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const lastStepRef = useRef<number>(-1);

  // Convert value to rotation (-135 to 135 degrees)
  useEffect(() => {
    const normalized = (value - min) / (max - min);
    setRotation(normalized * 270 - 135);
  }, [value, min, max]);

  const playClickSound = () => {
    // Create a subtle click sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.02);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.02);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updateValue(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    lastStepRef.current = -1;
  };

  const updateValue = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate angle from center
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Convert to 0-360 range and adjust for dial orientation
    angle = angle + 90;
    if (angle < 0) angle += 360;

    // Map angle to value range (-135° to 135°)
    let normalizedAngle: number;

    if (angle >= 315 || angle <= 45) {
      // Top range: map from 315-360 and 0-45 to 0-270
      if (angle >= 315) {
        normalizedAngle = angle - 315;
      } else {
        normalizedAngle = angle + 45;
      }
    } else if (angle > 45 && angle < 225) {
      // Left half
      normalizedAngle = angle - 45;
    } else {
      // Bottom range, clamp
      normalizedAngle = angle > 180 ? 0 : 270;
    }

    // Clamp to valid range
    normalizedAngle = Math.max(0, Math.min(270, normalizedAngle));

    // Convert to step-based value
    const stepSize = 270 / (steps - 1);
    const currentStep = Math.round(normalizedAngle / stepSize);

    // Only update if we've moved to a different step
    if (currentStep !== lastStepRef.current) {
      lastStepRef.current = currentStep;
      playClickSound();

      // Calculate the value
      const normalized = currentStep / (steps - 1);
      const newValue = min + normalized * (max - min);
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const currentStep = Math.round(((value - min) / (max - min)) * (steps - 1));
    const delta = e.deltaY > 0 ? -1 : 1;
    const newStep = Math.max(0, Math.min(steps - 1, currentStep + delta));

    if (newStep !== currentStep) {
      const normalized = newStep / (steps - 1);
      const newValue = min + normalized * (max - min);
      onChange(Math.max(min, Math.min(max, newValue)));
      playClickSound();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    updateValue(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateValue(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastStepRef.current = -1;
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  // Generate tick marks
  const ticks = [];
  const tickCount = 17;
  for (let i = 0; i < tickCount; i++) {
    const angle = -135 + (i * 270) / (tickCount - 1);
    const isQuarter = i % 4 === 0;
    const length = isQuarter ? 8 : 5;
    const opacity = isQuarter ? 0.6 : 0.3;

    ticks.push(
      <line
        key={i}
        x1="50"
        y1="5"
        x2="50"
        y2={5 + length}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity={opacity}
        transform={`rotate(${angle} 50 50)`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={dialRef}
        className="relative cursor-pointer select-none touch-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
      >
        {/* Tick marks */}
        <svg
          className="absolute inset-0 text-[var(--muted)]"
          viewBox="0 0 100 100"
          style={{ width: size, height: size }}
        >
          {ticks}
        </svg>

        {/* Dial body */}
        <div
          className="absolute inset-[12%] rounded-full"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(180, 180, 180, 0.9) 0%,
                rgba(220, 220, 220, 0.95) 25%,
                rgba(160, 160, 160, 0.85) 100%
              )
            `,
            boxShadow: `
              0 4px 8px rgba(0, 0, 0, 0.25),
              inset 0 2px 4px rgba(255, 255, 255, 0.4),
              inset 0 -2px 4px rgba(0, 0, 0, 0.2)
            `,
          }}
        >
          {/* Inner shadow ring */}
          <div
            className="absolute inset-[8%] rounded-full"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(200, 200, 200, 0.9) 0%,
                  rgba(240, 240, 240, 0.95) 50%,
                  rgba(180, 180, 180, 0.9) 100%
                )
              `,
              boxShadow: `
                inset 0 2px 6px rgba(0, 0, 0, 0.15),
                0 1px 2px rgba(255, 255, 255, 0.5)
              `,
            }}
          >
            {/* Indicator line */}
            <div
              className="absolute inset-0 flex items-start justify-center pt-[15%]"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.1s cubic-bezier(0.4, 0.0, 0.2, 1)',
              }}
            >
              <div
                className="w-[4px] h-[30%] rounded-full"
                style={{
                  background: 'linear-gradient(to bottom, rgba(80, 80, 80, 0.9), rgba(60, 60, 60, 0.95))',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {label && (
        <span className="te-label text-[8px]">{label}</span>
      )}
    </div>
  );
}
