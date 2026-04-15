import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "../../constants/theme";

export const LoadingBlock = ({ label }: { label: string }) => (
  <View style={styles.root}>
    <ActivityIndicator color={mobileTheme.colors.forest} />
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
    gap: 10,
    alignItems: "center",
  },
  label: {
    color: mobileTheme.colors.muted,
    textAlign: "center",
  },
});
