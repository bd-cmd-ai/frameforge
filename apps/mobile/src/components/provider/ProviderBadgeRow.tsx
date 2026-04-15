import { StyleSheet, View } from "react-native";
import type { BadgeKey } from "@radar-domace/types";
import { StatusBadge } from "../StatusBadge";

export const ProviderBadgeRow = ({ badges }: { badges: BadgeKey[] }) => (
  <View style={styles.row}>
    {badges.map((badge) => (
      <StatusBadge key={badge} badge={badge} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
