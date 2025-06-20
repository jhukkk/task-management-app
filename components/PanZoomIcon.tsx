import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PanZoomIconProps {
  size?: number;
  color?: string;
}

export default function PanZoomIcon({ size = 24, color = '#aaaaaa' }: PanZoomIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
      <Path d="M120-120v-240h80v104l124-124 56 56-124 124h104v80H120Zm516-460-56-56 124-124H600v-80h240v240h-80v-104L636-580Z" />
    </Svg>
  );
} 