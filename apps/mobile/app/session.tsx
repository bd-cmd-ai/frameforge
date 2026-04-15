import { router } from "expo-router";
import { Text, View } from "react-native";
import { AppButton } from "../src/components/AppButton";
import { AppScreen } from "../src/components/AppScreen";
import { LoadingState } from "../src/components/StatefulPanel";
import { useAuth } from "../src/lib/auth";

export default function SessionScreen() {
  const { configured, loading, session, profile, error, signOutCurrentUser } = useAuth();

  if (loading) {
    return (
      <AppScreen title="Checking session">
        <LoadingState label="Loading current session and profile..." />
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Session status" subtitle="This screen verifies auth state, role resolution, and environment wiring.">
      {!configured ? <Text>Supabase keys are missing in the mobile environment.</Text> : null}
      {error ? <Text>{error}</Text> : null}
      <View>
        <Text>Authenticated: {session ? "Yes" : "No"}</Text>
        <Text>Role: {profile?.role ?? "unknown"}</Text>
        <Text>Email: {profile?.email ?? "n/a"}</Text>
      </View>
      {profile?.role && profile.role !== "consumer" ? (
        <>
          <Text>Only consumer accounts can use the mobile app in this MVP.</Text>
          <AppButton
            label="Sign out"
            onPress={async () => {
              await signOutCurrentUser();
              router.replace("/(auth)/login");
            }}
          />
        </>
      ) : null}
    </AppScreen>
  );
}
