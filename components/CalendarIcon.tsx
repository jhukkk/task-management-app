import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface CalendarIconProps {
  size?: number;
  color?: string;
}

export default function CalendarIcon({ size = 24, color = '#aaaaaa' }: CalendarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer calendar outline */}
      <Rect
        x="2"
        y="3"
        width="20"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Header bar */}
      <Rect
        x="2"
        y="7"
        width="20"
        height="2"
        fill={color}
      />
      {/* First row of day dots */}
      <Rect x="6" y="11" width="2" height="2" rx="0.5" fill={color} />
      <Rect x="10" y="11" width="2" height="2" rx="0.5" fill={color} />
      <Rect x="14" y="11" width="2" height="2" rx="0.5" fill={color} />
      {/* Second row of day dots */}
      <Rect x="6" y="15" width="2" height="2" rx="0.5" fill={color} />
      <Rect x="10" y="15" width="2" height="2" rx="0.5" fill={color} />
      <Rect x="14" y="15" width="2" height="2" rx="0.5" fill={color} />
    </Svg>
  );
} 