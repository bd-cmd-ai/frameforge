import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppScreen } from "../../src/components/AppScreen";

export default function ProfileScreen() {
  return (
    <AppScreen title="Profile & settings" subtitle="Consumer controls stay intentionally light in the MVP.">
      <View style={styles.card}>
        <Text style={styles.label}>Language</Text>
        <Text style={styles.value}>Slovenščina</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Location access</Text>
        <Text style={styles.value}>While using the app</Text>
      </View>
      <AppButton label="Open provider portal" variant="secondary" onPress={() => router.push("/(auth)/login")} />
      <AppButton label="Sign out" variant="ghost" onPress={() => router.replace("/splash")} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#fffdf7",
    borderWidth: 1,
    borderColor: "#d8d0c0",
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: "#627063",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#142013",
  },
});
