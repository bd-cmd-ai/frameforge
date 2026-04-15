import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { ExploreFilters, ProviderCategory } from "@radar-domace/types";
import { mobileTheme } from "../../constants/theme";
import { pickLocalizedText } from "../../lib/formatting/localized-text";
import { AppButton } from "../AppButton";
import { RadiusSelector } from "./RadiusSelector";

interface FilterSheetProps {
  filters: ExploreFilters;
  categories: ProviderCategory[];
  onChange: (filters: ExploreFilters) => void;
  onReset: () => void;
}

export const FilterSheet = ({ filters, categories, onChange, onReset }: FilterSheetProps) => {
  const toggleCategory = (slug: string) =>
    onChange({
      ...filters,
      categoryKeys: filters.categoryKeys.includes(slug)
        ? filters.categoryKeys.filter((item) => item !== slug)
        : [...filters.categoryKeys, slug],
    });

  const toggle = (key: keyof Pick<ExploreFilters, "onlyOpenNow" | "onlyVerified" | "onlyFreshToday" | "onlyDiscount">) =>
    onChange({
      ...filters,
      [key]: !filters[key],
    });

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>Filters</Text>
      <Text style={styles.subtitle}>Adjust category, status, and radius without leaving the Explore flow.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Radius</Text>
        <RadiusSelector value={filters.radiusKm} onChange={(radiusKm) => onChange({ ...filters, radiusKm })} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          {categories.map((category) => {
            const active = filters.categoryKeys.includes(category.slug);
            return (
              <Pressable
                key={category.id}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => toggleCategory(category.slug)}
              >
                <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{pickLocalizedText(category.label)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {[
        ["Open now", "onlyOpenNow"],
        ["Verified only", "onlyVerified"],
        ["Fresh today", "onlyFreshToday"],
        ["Discount only", "onlyDiscount"],
      ].map(([label, key]) => (
        <View key={key} style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{label}</Text>
          <Switch
            value={filters[key as keyof ExploreFilters] as boolean}
            onValueChange={() => toggle(key as "onlyOpenNow" | "onlyVerified" | "onlyFreshToday" | "onlyDiscount")}
          />
        </View>
      ))}

      <View style={styles.actions}>
        <AppButton label="Apply filters" onPress={() => router.back()} />
        <AppButton label="Reset" variant="ghost" onPress={onReset} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 18,
    gap: 18,
    backgroundColor: mobileTheme.colors.cream,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: mobileTheme.colors.ink,
  },
  subtitle: {
    color: mobileTheme.colors.muted,
    lineHeight: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: mobileTheme.colors.forest,
    borderColor: mobileTheme.colors.forest,
  },
  categoryLabel: {
    color: mobileTheme.colors.ink,
    fontWeight: "700",
  },
  categoryLabelActive: {
    color: "#ffffff",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  toggleLabel: {
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  actions: {
    gap: 10,
    marginBottom: 24,
  },
});
