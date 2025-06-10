import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Flag2IconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export default function Flag2Icon({ size = 24, color = '#aaaaaa', filled = false }: Flag2IconProps) {
  const pathData = filled 
    ? "M200-80v-760h680l-80 240 80 240H280v280h-80Z" // Filled version - just the outer shape
    : "M200-80v-760h680l-80 240 80 240H280v280h-80Zm80-360h482l-48-160 48-160H280v320Zm0 0v-320 320Z"; // Outlined version

  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
      <Path d={pathData} />
    </Svg>
  );
} 