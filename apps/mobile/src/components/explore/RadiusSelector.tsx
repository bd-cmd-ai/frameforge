import { Pressable, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "../../constants/theme";

const radiusOptions = [1, 5, 10, 20];

export const RadiusSelector = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <View style={styles.row}>
    {radiusOptions.map((radius) => (
      <Pressable
        key={radius}
        style={[styles.chip, value === radius && styles.chipActive]}
        onPress={() => onChange(radius)}
      >
        <Text style={[styles.label, value === radius && styles.labelActive]}>{radius} km</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  chipActive: {
    backgroundColor: mobileTheme.colors.forest,
    borderColor: mobileTheme.colors.forest,
  },
  label: {
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  labelActive: {
    color: "#ffffff",
  },
});
