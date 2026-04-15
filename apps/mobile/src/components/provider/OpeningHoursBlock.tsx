import { StyleSheet, Text, View } from "react-native";
import type { OpeningHour } from "@radar-domace/types";
import { mobileTheme } from "../../constants/theme";
import { formatWeekdayLabel, getOpenStatusLabel } from "../../lib/opening-hours/status";

export const OpeningHoursBlock = ({ hours }: { hours: OpeningHour[] }) => (
  <View style={styles.root}>
    <Text style={styles.title}>Opening hours</Text>
    <Text style={styles.status}>{getOpenStatusLabel(hours)}</Text>
    {hours.map((entry) => (
      <View key={entry.id} style={styles.row}>
        <Text style={styles.day}>{formatWeekdayLabel(entry.dayOfWeek)}</Text>
        <Text style={styles.value}>{entry.isClosed ? "Closed" : `${entry.opensAt} – ${entry.closesAt}`}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  root: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  status: {
    color: mobileTheme.colors.forest,
    fontWeight: "700",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  day: {
    color: mobileTheme.colors.muted,
  },
  value: {
    color: mobileTheme.colors.ink,
    fontWeight: "700",
  },
});
