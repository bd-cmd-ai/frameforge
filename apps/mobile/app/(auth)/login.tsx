import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppScreen } from "../../src/components/AppScreen";

export default function LoginScreen() {
  return (
    <AppScreen title="Welcome back" subtitle="Use Supabase Auth for email/password or magic link in the real environment.">
      <View style={styles.form}>
        <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Password" style={styles.input} secureTextEntry />
      </View>
      <AppButton label="Sign in" onPress={() => router.replace("/(tabs)/explore")} />
      <Text style={styles.helper} onPress={() => router.push("/(auth)/register")}>
        No account yet? Create one
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  input: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#fffdf7",
    borderWidth: 1,
    borderColor: "#d8d0c0",
  },
  helper: {
    textAlign: "center",
    color: "#2e5b2c",
    fontWeight: "700",
    marginTop: 4,
  },
});
