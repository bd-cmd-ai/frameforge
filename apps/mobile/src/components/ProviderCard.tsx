import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import type { ProviderSummary } from "@radar-domace/types";
import { mobileTheme } from "../constants/theme";
import { StatusBadge } from "./StatusBadge";

interface ProviderCardProps {
  provider: ProviderSummary;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const ProviderCard = ({
  provider,
  isFavorite,
  onPress,
  onToggleFavorite,
}: ProviderCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <ImageBackground source={{ uri: provider.coverImage ?? undefined }} style={styles.cover} imageStyle={styles.coverImage}>
      <Pressable style={styles.favoriteButton} onPress={onToggleFavorite}>
        <Text style={styles.favoriteLabel}>{isFavorite ? "Saved" : "Save"}</Text>
      </Pressable>
    </ImageBackground>
    <View style={styles.content}>
      <Text style={styles.name}>{provider.name.sl}</Text>
      <Text style={styles.meta}>
        {(provider.distanceMeters / 1000).toFixed(1)} km • {provider.address.sl}
      </Text>
      <Text style={styles.description}>{provider.shortDescription.sl}</Text>
      <View style={styles.badges}>
        {provider.badges.map((badge) => (
          <StatusBadge key={badge} badge={badge} />
        ))}
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: mobileTheme.colors.panel,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  cover: {
    minHeight: 150,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: 12,
  },
  coverImage: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  favoriteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.88)",
  },
  favoriteLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  content: {
    padding: 14,
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  meta: {
    fontSize: 13,
    color: mobileTheme.colors.muted,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: mobileTheme.colors.ink,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
