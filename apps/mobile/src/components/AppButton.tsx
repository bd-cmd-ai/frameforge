import { Pressable, StyleSheet, Text } from "react-native";
import { mobileTheme } from "../constants/theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
}

export const AppButton = ({ label, onPress, variant = "primary" }: AppButtonProps) => (
  <Pressable
    style={[styles.button, styles[variant]]}
    onPress={onPress}
  >
    <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
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
