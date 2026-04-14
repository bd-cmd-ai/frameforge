import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../src/components/AppButton";
import { AppScreen } from "../src/components/AppScreen";

const steps = [
  "Allow location access to see producers near your route.",
  "Use quick filters for open now, verified, fresh today, and category.",
  "Open any producer to view offers, hours, and launch navigation in one tap.",
];

export default function OnboardingScreen() {
  return (
    <AppScreen title="How it works" subtitle="Designed for quick roadside discovery and zero clutter.">
      {steps.map((step, index) => (
        <View key={step} style={styles.step}>
          <Text style={styles.number}>0{index + 1}</Text>
          <Text style={styles.copy}>{step}</Text>
        </View>
      ))}
      <AppButton label="Continue to login" onPress={() => router.push("/(auth)/login")} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  step: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#fffdf7",
    borderWidth: 1,
    borderColor: "#d8d0c0",
    flexDirection: "row",
    gap: 14,
  },
  number: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2e5b2c",
  },
  copy: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#142013",
  },
});
