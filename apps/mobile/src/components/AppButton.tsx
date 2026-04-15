import { Pressable, StyleSheet, Text } from "react-native";
import { mobileTheme } from "../constants/theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}

export const AppButton = ({ label, onPress, variant = "primary", disabled = false }: AppButtonProps) => (
  <Pressable
    style={[styles.button, styles[variant], disabled ? styles.disabled : null]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.label, styles[`${variant}Label`], disabled ? styles.disabledLabel : null]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: mobileTheme.colors.forest,
  },
  secondary: {
    backgroundColor: mobileTheme.colors.sand,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
  disabledLabel: {
    opacity: 0.95,
  },
  primaryLabel: {
    color: "#ffffff",
  },
  secondaryLabel: {
    color: mobileTheme.colors.ink,
  },
  ghostLabel: {
    color: mobileTheme.colors.ink,
  },
});
