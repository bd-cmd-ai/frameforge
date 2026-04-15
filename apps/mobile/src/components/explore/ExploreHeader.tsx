import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ProviderCategory } from "@radar-domace/types";
import { mobileTheme } from "../../constants/theme";
import { pickLocalizedText } from "../../lib/formatting/localized-text";
import { RadiusSelector } from "./RadiusSelector";

interface ExploreHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  radiusKm: number;
  onRadiusChange: (value: number) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  quickCategories: ProviderCategory[];
  selectedCategoryKeys: string[];
  onToggleQuickCategory: (key: string) => void;
  viewMode: "map" | "list";
  onViewModeChange: (mode: "map" | "list") => void;
}

export const ExploreHeader = ({
  searchQuery,
  onSearchChange,
  radiusKm,
  onRadiusChange,
  activeFilterCount,
  onOpenFilters,
  quickCategories,
  selectedCategoryKeys,
  onToggleQuickCategory,
  viewMode,
  onViewModeChange,
}: ExploreHeaderProps) => (
  <View style={styles.root}>
    <View style={styles.titleRow}>
      <View>
        <Text style={styles.title}>Explore nearby</Text>
        <Text style={styles.subtitle}>Local food producers on your route</Text>
      </View>
      <View style={styles.modeToggle}>
        {(["map", "list"] as const).map((mode) => (
          <Pressable
            key={mode}
            style={[styles.modeChip, viewMode === mode && styles.modeChipActive]}
            onPress={() => onViewModeChange(mode)}
          >
            <Text style={[styles.modeLabel, viewMode === mode && styles.modeLabelActive]}>
              {mode === "map" ? "Map" : "List"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>

    <View style={styles.searchRow}>
      <TextInput
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search farms, cheeses, honey..."
        placeholderTextColor={mobileTheme.colors.muted}
        style={styles.searchInput}
      />
      <Pressable style={styles.filterButton} onPress={onOpenFilters}>
        <Text style={styles.filterLabel}>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</Text>
      </Pressable>
    </View>

    <RadiusSelector value={radiusKm} onChange={onRadiusChange} />

    <View style={styles.quickRow}>
      {quickCategories.map((category) => {
        const active = selectedCategoryKeys.includes(category.slug);
        return (
          <Pressable
            key={category.id}
            style={[styles.quickChip, active && styles.quickChipActive]}
            onPress={() => onToggleQuickCategory(category.slug)}
          >
            <Text style={[styles.quickLabel, active && styles.quickLabelActive]}>{pickLocalizedText(category.label)}</Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: mobileTheme.colors.ink,
  },
  subtitle: {
    color: mobileTheme.colors.muted,
    marginTop: 4,
  },
  modeToggle: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 999,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modeChipActive: {
    backgroundColor: mobileTheme.colors.forest,
  },
  modeLabel: {
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  modeLabelActive: {
    color: "#ffffff",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  filterButton: {
    minWidth: 96,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
    paddingHorizontal: 12,
  },
  filterLabel: {
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3efe4",
  },
  quickChipActive: {
    backgroundColor: mobileTheme.colors.sand,
  },
  quickLabel: {
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  quickLabelActive: {
    color: mobileTheme.colors.forest,
  },
});
