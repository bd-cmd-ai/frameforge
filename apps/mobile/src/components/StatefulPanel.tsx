import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "../constants/theme";

export const LoadingState = ({ label }: { label: string }) => (
  <View style={styles.panel}>
    <ActivityIndicator color={mobileTheme.colors.forest} />
    <Text style={styles.text}>{label}</Text>
  </View>
);

export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.panel}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{description}</Text>
  </View>
);

export const ErrorState = ({ description }: { description: string }) => (
  <View style={styles.errorPanel}>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.text}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  panel: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
    gap: 8,
    alignItems: "center",
  },
  errorPanel: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#fff4ef",
    borderWidth: 1,
    borderColor: "#f2b7a1",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: mobileTheme.colors.muted,
    textAlign: "center",
  },
});
