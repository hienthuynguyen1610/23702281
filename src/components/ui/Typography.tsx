import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { COLORS } from '@constants/theme';

interface Props extends TextProps {
  variant?: 'regular' | 'bold';
  style?: TextStyle | TextStyle[];
}

const Typography: React.FC<Props> = ({ children, variant = 'regular', style, ...props }) => {
  return (
    <Text style={[{ fontWeight: variant === 'bold' ? 'bold' : 'normal', color: COLORS.text }, style]} {...props}>
      {children}
    </Text>
  );
};
export default Typography;