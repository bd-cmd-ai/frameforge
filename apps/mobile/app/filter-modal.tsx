import { router } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { AppButton } from "../src/components/AppButton";
import { AppScreen } from "../src/components/AppScreen";
import { mobileTheme } from "../src/constants/theme";
import { useMobileAppState } from "../src/lib/app-state";

export default function FilterModal() {
  const { filters, setFilters } = useMobileAppState();

  const toggle = (key: "onlyOpenNow" | "onlyVerified" | "onlyFreshToday") =>
    setFilters({ ...filters, [key]: !filters[key] });

  return (
    <AppScreen title="Filters" subtitle="Fast, explicit, and easy to reset while on the road.">
      <View style={styles.radiusRow}>
        {[10, 15, 30, 50].map((radius) => (
          <Pressable
            key={radius}
            style={[styles.chip, filters.radiusKm === radius && styles.chipActive]}
            onPress={() => setFilters({ ...filters, radiusKm: radius })}
          >
            <Text style={[styles.chipLabel, filters.radiusKm === radius && styles.chipLabelActive]}>{radius} km</Text>
          </Pressable>
        ))}
      </View>

      {[
        ["Open now", "onlyOpenNow"],
        ["Verified only", "onlyVerified"],
        ["Fresh today", "onlyFreshToday"],
      ].map(([label, key]) => (
        <View key={key} style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Switch
            value={filters[key as keyof typeof filters] as boolean}
            onValueChange={() => toggle(key as "onlyOpenNow" | "onlyVerified" | "onlyFreshToday")}
          />
        </View>
      ))}

      <AppButton label="Apply filters" onPress={() => router.back()} />
      <AppButton
        label="Reset"
        variant="ghost"
        onPress={() =>
          setFilters({
            radiusKm: 15,
            categoryIds: [],
            onlyOpenNow: false,
            onlyVerified: false,
            onlyFreshToday: false,
          })
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  radiusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#fffdf7",
    borderWidth: 1,
    borderColor: "#d8d0c0",
  },
  chipActive: {
    backgroundColor: mobileTheme.colors.forest,
    borderColor: mobileTheme.colors.forest,
  },
  chipLabel: {
    color: mobileTheme.colors.ink,
    fontWeight: "700",
  },
  chipLabelActive: {
    color: "#ffffff",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d8d0c0",
    backgroundColor: "#fffdf7",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
});
