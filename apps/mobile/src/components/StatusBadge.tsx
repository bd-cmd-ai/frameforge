import { StyleSheet, Text, View } from "react-native";
import type { BadgeKey } from "@radar-domace/types";
import { mobileTheme } from "../constants/theme";

const labelMap: Record<BadgeKey, string> = {
  verified: "Verified",
  fresh_today: "Fresh Today",
  discount: "Discount",
  open_now: "Open Now",
  promoted: "Promoted",
};

export const StatusBadge = ({ badge }: { badge: BadgeKey }) => (
  <View style={styles.badge}>
    <Text style={styles.label}>{labelMap[badge]}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#edf4e6",
    borderWidth: 1,
    borderColor: "#cddabf",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: mobileTheme.colors.forest,
  },
});
