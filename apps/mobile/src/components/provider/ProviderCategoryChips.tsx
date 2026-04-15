import { StyleSheet, Text, View } from "react-native";
import type { ProviderCategory } from "@radar-domace/types";
import { mobileTheme } from "../../constants/theme";
import { pickLocalizedText } from "../../lib/formatting/localized-text";

export const ProviderCategoryChips = ({ categories }: { categories: ProviderCategory[] }) => (
  <View style={styles.row}>
    {categories.map((category) => (
      <View key={category.id} style={styles.chip}>
        <Text style={styles.label}>{pickLocalizedText(category.label)}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f3efe4",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
});
