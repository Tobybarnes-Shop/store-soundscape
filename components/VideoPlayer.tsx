'use client';

interface VideoPlayerProps {
  src: string;
  title?: string;
}

export default function VideoPlayer({ src, title = 'Video' }: VideoPlayerProps) {
  return (
    <div className="te-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="te-label text-[8px]">Video</span>
        {title && (
          <span className="text-[8px] text-[var(--muted)] font-mono">{title}</span>
        )}
      </div>
      <div className="te-display p-0 overflow-hidden">
        <video
          src={src}
          controls
          muted
          autoPlay
          loop
          playsInline
          className="w-full h-auto"
          style={{
            height: '300px',
            objectFit: 'contain',
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
