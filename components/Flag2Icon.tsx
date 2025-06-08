import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Flag2IconProps {
  size?: number;
  color?: string;
}

export default function Flag2Icon({ size = 24, color = '#aaaaaa' }: Flag2IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
      <Path d="M200-80v-760h640l-80 200 80 200H280v360h-80Zm80-440h442l-48-120 48-120H280v240Zm0 0v-240 240Z" />
    </Svg>
  );
} 