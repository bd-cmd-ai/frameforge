import { StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "../../constants/theme";

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <View style={styles.root}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
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
