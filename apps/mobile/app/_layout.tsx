import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../src/lib/auth";
import { DiscoverySessionProvider } from "../src/hooks/providers/useDiscoverySession";

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { loading, session, profile } = useAuth();

  useEffect(() => {
    if (loading) return;

    const segment = segments[0];
    const isPublicRoute = segment === "splash" || segment === "onboarding" || segment === "(auth)";
    const isTabsRoute = segment === "(tabs)";
    const isConsumerProtectedRoute = isTabsRoute || segment === "provider" || segment === "filter-modal";

    if (!session) {
      if (!isPublicRoute) {
        router.replace("/(auth)/login");
      }
      return;
    }

    if (profile?.role && profile.role !== "consumer") {
      router.replace("/session");
      return;
    }

    if (!profile?.role) return;

    if (isPublicRoute || segment === "session" || !isConsumerProtectedRoute) {
      router.replace("/(tabs)/explore");
    }
  }, [loading, profile?.role, router, segments, session]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="session" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="filter-modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="provider/[slug]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DiscoverySessionProvider>
        <RootNavigator />
      </DiscoverySessionProvider>
    </AuthProvider>
  );
}
