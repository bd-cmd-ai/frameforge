import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MobileAppStateProvider } from "../src/lib/app-state";

export default function RootLayout() {
  return (
    <MobileAppStateProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="filter-modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="provider/[id]" />
      </Stack>
    </MobileAppStateProvider>
  );
}
