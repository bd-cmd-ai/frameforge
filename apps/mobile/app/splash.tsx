import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../src/components/AppButton";
import { AppScreen } from "../src/components/AppScreen";
import { mobileTheme } from "../src/constants/theme";

export default function SplashScreen() {
  return (
    <AppScreen scrollable={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Radar Domače</Text>
        <Text style={styles.title}>Discover local producers while you travel.</Text>
        <Text style={styles.body}>
          Open the map, set your radius, and quickly find verified farms, dairies, and artisan food stops nearby.
        </Text>
      </View>
      <View style={styles.actions}>
        <AppButton label="Get started" onPress={() => router.push("/onboarding")} />
        <AppButton label="Sign in" variant="ghost" onPress={() => router.push("/(auth)/login")} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 80,
    gap: 16,
  },
  eyebrow: {
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: mobileTheme.colors.forest,
    fontWeight: "700",
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "800",
    color: mobileTheme.colors.ink,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: mobileTheme.colors.muted,
  },
  actions: {
    gap: 12,
    paddingBottom: 32,
  },
});
