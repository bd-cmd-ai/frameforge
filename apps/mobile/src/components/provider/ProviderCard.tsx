import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { ProviderSummary } from "@radar-domace/types";
import { mobileTheme } from "../../constants/theme";
import { formatDistance } from "../../lib/formatting/distance";
import { pickLocalizedText } from "../../lib/formatting/localized-text";
import { resolveProviderImageUrl } from "../../lib/formatting/provider-image";
import { AppButton } from "../AppButton";
import { ProviderBadgeRow } from "./ProviderBadgeRow";
import { ProviderCategoryChips } from "./ProviderCategoryChips";

interface ProviderCardProps {
  provider: ProviderSummary;
  isFavorite: boolean;
  isSelected?: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const ProviderCard = ({
  provider,
  isFavorite,
  isSelected = false,
  onPress,
  onToggleFavorite,
}: ProviderCardProps) => {
  const imageUrl = resolveProviderImageUrl(provider.coverImage);

  return (
    <Pressable style={[styles.card, isSelected && styles.cardSelected]} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackLabel}>No photo yet</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.name}>{pickLocalizedText(provider.name)}</Text>
            <Text style={styles.meta}>
              {formatDistance(provider.distanceMeters)} • {provider.isOpenNow ? "Open now" : "Closed"}
            </Text>
          </View>
          <Pressable
            style={styles.favoriteButton}
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Text style={styles.favoriteLabel}>{isFavorite ? "Saved" : "Save"}</Text>
          </Pressable>
        </View>

        <ProviderCategoryChips categories={provider.categories} />
        <ProviderBadgeRow badges={provider.badges} />
        <Text style={styles.description}>{pickLocalizedText(provider.shortDescription)}</Text>

        <View style={styles.ctaRow}>
          <AppButton label="Details" onPress={onPress} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: mobileTheme.colors.panel,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  cardSelected: {
    borderColor: mobileTheme.colors.forest,
    borderWidth: 2,
  },
  image: {
    width: "100%",
    height: 146,
    backgroundColor: "#e9e4d8",
  },
  imageFallback: {
    width: "100%",
    height: 146,
    backgroundColor: "#ece4d4",
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackLabel: {
    fontWeight: "700",
    color: mobileTheme.colors.muted,
  },
  content: {
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  meta: {
    color: mobileTheme.colors.muted,
  },
  favoriteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3efe4",
    alignSelf: "flex-start",
  },
  favoriteLabel: {
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  description: {
    lineHeight: 20,
    color: mobileTheme.colors.ink,
  },
  ctaRow: {
    marginTop: 2,
  },
});
