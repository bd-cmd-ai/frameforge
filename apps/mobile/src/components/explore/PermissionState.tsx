import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../AppButton";
import { mobileTheme } from "../../constants/theme";

interface PermissionStateProps {
  title: string;
  description: string;
  ctaLabel: string;
  onPress: () => void;
}

export const PermissionState = ({ title, description, ctaLabel, onPress }: PermissionStateProps) => (
  <View style={styles.root}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    <AppButton label={ctaLabel} onPress={onPress} />
  </View>
);

const styles = StyleSheet.create({
  root: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  description: {
    lineHeight: 20,
    color: mobileTheme.colors.muted,
  },
});
