import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS } from '@constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const ShopButton: React.FC<Props> = ({ title, onPress, variant = 'primary', isLoading, disabled, style }) => {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isPrimary ? styles.bgPrimary : styles.bgOutline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : COLORS.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textOutline]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bgPrimary: { backgroundColor: COLORS.primary },
  bgOutline: { borderWidth: 1, borderColor: COLORS.primary, backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  text: { fontWeight: 'bold' },
  textPrimary: { color: '#FFFFFF' },
  textOutline: { color: COLORS.primary },
});
export default ShopButton;