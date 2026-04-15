import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppScreen } from "../../src/components/AppScreen";
import { useAuth } from "../../src/lib/auth";

export default function LoginScreen() {
  const { signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Enter both email and password to continue.");
      return;
    }

    const nextError = await signInWithEmail(email.trim(), password);
    if (nextError) {
      setError(nextError);
      return;
    }
    router.replace("/(tabs)/explore");
  };

  return (
    <AppScreen title="Sign in" subtitle="Consumer accounts use Supabase Auth and profile-based role resolution.">
      <View style={styles.form}>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} autoCapitalize="none" />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} secureTextEntry />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton
        label={loading ? "Signing in..." : "Sign in"}
        onPress={() => void submit()}
        disabled={loading}
      />
      <AppButton label="Create consumer account" variant="ghost" onPress={() => router.push("/(auth)/register")} />
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
