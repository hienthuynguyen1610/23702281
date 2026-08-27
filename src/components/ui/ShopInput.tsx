import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '@constants/theme';

const ShopInput: React.FC<TextInputProps> = (props) => {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor={COLORS.textLight}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.text,
  },
});
export default ShopInput;