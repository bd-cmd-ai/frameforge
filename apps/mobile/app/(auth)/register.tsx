import { router } from "expo-router";
import { StyleSheet, TextInput, View } from "react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppScreen } from "../../src/components/AppScreen";

export default function RegisterScreen() {
  return (
    <AppScreen title="Create account" subtitle="Consumer onboarding is lightweight for the MVP. Provider claiming happens in the web portal.">
      <View style={styles.form}>
        <TextInput placeholder="Full name" style={styles.input} />
        <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Password" style={styles.input} secureTextEntry />
      </View>
      <AppButton label="Create account" onPress={() => router.replace("/(tabs)/explore")} />
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
});
