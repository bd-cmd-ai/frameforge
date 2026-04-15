import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppScreen } from "../../src/components/AppScreen";
import { useAuth } from "../../src/lib/auth";

export default function RegisterScreen() {
  const { signUpWithEmail, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Fill in your name, email, and password.");
      return;
    }

    if (password.length < 8) {
      setError("Use at least 8 characters for the password.");
      return;
    }

    const nextError = await signUpWithEmail({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      role: "consumer",
    });
    if (nextError) {
      setError(nextError);
      return;
    }
    router.replace("/(tabs)/explore");
  };

  return (
    <AppScreen title="Create account" subtitle="New mobile users are created as `consumer` profiles by default.">
      <View style={styles.form}>
        <TextInput value={fullName} onChangeText={setFullName} placeholder="Full name" style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} autoCapitalize="none" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} secureTextEntry />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton
        label={loading ? "Creating..." : "Create account"}
        onPress={() => void submit()}
        disabled={loading}
      />
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
  error: {
    color: "#b03c1f",
  },
});
