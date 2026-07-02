import React from 'react';

export interface DeviceBarData {
  /** Viewport width in px (e.g. 375, 768, 1440). */
  width: number;
  /** Bar height in px (e.g. 120, 160, 220). */
  height: number;
  /** Width label displayed in the bar (e.g. "375"). */
  label: string;
  /** Device name displayed below the width label (e.g. "mobile", "tablet"). */
  name: string;
}

export interface DeviceLadderProps {
  /** Array of device bars. Defaults to the standard 6-viewport ladder
   *  (375/mobile through 1440/wide). */
  devices?: DeviceBarData[];
  /** Additional CSS classes. */
  className?: string;
}

const DEFAULT_DEVICES: DeviceBarData[] = [
  { width: 60, height: 120, label: '375', name: 'mobile' },
  { width: 90, height: 140, label: '600', name: 'small phone' },
  { width: 140, height: 160, label: '768', name: 'tablet' },
  { width: 200, height: 180, label: '1024', name: 'laptop' },
  { width: 260, height: 200, label: '1280', name: 'desktop' },
  { width: 320, height: 220, label: '1440', name: 'wide' },
];

/** Device ladder — viewport-width reference bars aligned to the bottom.
 *  Each bar is a rounded rectangle with surface-raised background and
 *  mono-space text showing the width + device name. Used in responsive
 *  design documentation to illustrate the breakpoint spectrum. */
export function DeviceLadder({ devices = DEFAULT_DEVICES, className = '' }: DeviceLadderProps) {
  return (
    <div className={`flex items-end gap-4 flex-wrap mb-8 ${className}`}>
      {devices.map((device) => (
        <div
          key={device.label}
          className="bg-surface-raised rounded-sm text-text-muted text-center p-2 text-xs font-mono flex-shrink-0"
          style={{ width: device.width, height: device.height }}
        >
          {device.label}<br />{device.name}
        </div>
      ))}
    </div>
  );
}
