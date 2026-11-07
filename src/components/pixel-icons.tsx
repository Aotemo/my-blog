type IconProps = { className?: string };

const baseProps = {
  viewBox: "0 0 8 8",
  shapeRendering: "crispEdges" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

/** 8×8 像素小精灵 */
export function PixelSprite({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="currentColor">
      <rect x="2" y="0" width="4" height="1" />
      <rect x="1" y="1" width="6" height="1" />
      <rect x="1" y="2" width="6" height="4" />
      <rect x="1" y="6" width="6" height="1" />
      <rect x="1" y="7" width="1" height="1" />
      <rect x="3" y="7" width="2" height="1" />
      <rect x="6" y="7" width="1" height="1" />
      <rect x="2" y="2" width="1" height="2" fill="var(--bg)" />
      <rect x="5" y="2" width="1" height="2" fill="var(--bg)" />
      <rect x="3" y="5" width="2" height="1" fill="var(--bg)" />
    </svg>
  );
}

export function PixelSearch({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="currentColor">
      <rect x="1" y="0" width="4" height="1" />
      <rect x="0" y="1" width="1" height="3" />
      <rect x="5" y="1" width="1" height="3" />
      <rect x="1" y="4" width="4" height="1" />
      <rect x="4" y="5" width="1" height="1" />
      <rect x="5" y="6" width="1" height="1" />
      <rect x="6" y="7" width="2" height="1" />
    </svg>
  );
}

export function PixelSun({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="currentColor">
      <rect x="3" y="0" width="2" height="1" />
      <rect x="3" y="7" width="2" height="1" />
      <rect x="0" y="3" width="1" height="2" />
      <rect x="7" y="3" width="1" height="2" />
      <rect x="1" y="1" width="1" height="1" />
      <rect x="6" y="1" width="1" height="1" />
      <rect x="1" y="6" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
      <rect x="2" y="2" width="4" height="4" />
    </svg>
  );
}

export function PixelMoon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="currentColor">
      <rect x="3" y="0" width="3" height="1" />
      <rect x="2" y="1" width="3" height="1" />
      <rect x="1" y="2" width="3" height="4" />
      <rect x="2" y="6" width="3" height="1" />
      <rect x="3" y="7" width="3" height="1" />
      <rect x="1" y="3" width="1" height="2" fill="var(--bg)" />
    </svg>
  );
}

export function PixelRss({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="currentColor">
      <rect x="0" y="0" width="2" height="2" />
      <rect x="3" y="0" width="1" height="1" />
      <rect x="5" y="1" width="1" height="1" />
      <rect x="6" y="3" width="1" height="1" />
      <rect x="7" y="5" width="1" height="1" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="0" y="5" width="3" height="3" />
      <rect x="4" y="4" width="1" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
    </svg>
  );
}

export function PixelGithub({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="currentColor">
      <rect x="2" y="0" width="4" height="1" />
      <rect x="1" y="1" width="6" height="1" />
      <rect x="0" y="2" width="8" height="3" />
      <rect x="1" y="5" width="6" height="1" />
      <rect x="2" y="6" width="1" height="1" />
      <rect x="5" y="6" width="1" height="1" />
      <rect x="1" y="7" width="1" height="1" />
      <rect x="6" y="7" width="1" height="1" />
      <rect x="2" y="3" width="1" height="1" fill="var(--bg)" />
      <rect x="5" y="3" width="1" height="1" fill="var(--bg)" />
    </svg>
  );
}

export function PixelEye({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="currentColor">
      <rect x="2" y="2" width="4" height="1" />
      <rect x="1" y="3" width="1" height="2" />
      <rect x="6" y="3" width="1" height="2" />
      <rect x="2" y="5" width="4" height="1" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="0" y="3" width="1" height="2" />
      <rect x="7" y="3" width="1" height="2" />
    </svg>
  );
}

export function PixelClock({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg {...baseProps} className={className} fill="currentColor">
      <rect x="2" y="0" width="4" height="1" />
      <rect x="1" y="1" width="2" height="1" />
      <rect x="5" y="1" width="2" height="1" />
      <rect x="0" y="2" width="1" height="4" />
      <rect x="7" y="2" width="1" height="4" />
      <rect x="1" y="6" width="2" height="1" />
      <rect x="5" y="6" width="2" height="1" />
      <rect x="2" y="7" width="4" height="1" />
      <rect x="3" y="2" width="1" height="3" />
      <rect x="4" y="4" width="2" height="1" />
    </svg>
  );
}
