import { router } from "expo-router";
import { Text, View } from "react-native";
import { AppButton } from "../../src/components/AppButton";
import { AppScreen } from "../../src/components/AppScreen";
import { useAuth } from "../../src/lib/auth";

export default function ProfileScreen() {
  const { profile, signOutCurrentUser } = useAuth();

  return (
    <AppScreen title="Profile" subtitle="Session, role, and sign-out verification.">
      <View>
        <Text>Name: {profile?.fullName || "n/a"}</Text>
        <Text>Email: {profile?.email || "n/a"}</Text>
        <Text>Role: {profile?.role || "n/a"}</Text>
      </View>
      <AppButton
        label="Sign out"
        onPress={async () => {
          await signOutCurrentUser();
          router.replace("/(auth)/login");
        }}
      />
    </AppScreen>
  );
}
