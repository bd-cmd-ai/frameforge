import { router, useLocalSearchParams } from "expo-router";
import { trackAnalyticsEvent } from "@radar-domace/api";
import { useEffect } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../src/components/AppButton";
import { ErrorState } from "../../src/components/StatefulPanel";
import { EmptyState } from "../../src/components/explore/EmptyState";
import { LoadingBlock } from "../../src/components/explore/LoadingBlock";
import { OpeningHoursBlock } from "../../src/components/provider/OpeningHoursBlock";
import { ProviderBadgeRow } from "../../src/components/provider/ProviderBadgeRow";
import { ProviderCategoryChips } from "../../src/components/provider/ProviderCategoryChips";
import { ProviderImageCarousel } from "../../src/components/provider/ProviderImageCarousel";
import { mobileTheme } from "../../src/constants/theme";
import { useAuth } from "../../src/lib/auth";
import { formatDistance } from "../../src/lib/formatting/distance";
import { pickLocalizedText } from "../../src/lib/formatting/localized-text";
import { resolveProviderImageUrl } from "../../src/lib/formatting/provider-image";
import { openNavigationRoute, openPhoneDialer, openWebsite } from "../../src/lib/maps/provider-links";
import { getDistanceMeters } from "../../src/lib/distance/getDistanceMeters";
import { useDiscoverySession } from "../../src/hooks/providers/useDiscoverySession";
import { useProviderDetail } from "../../src/hooks/providers/useProviderDetail";
import { getMobileSupabaseClient } from "../../src/lib/supabase";
import { isMobileSupabaseConfigured } from "../../src/lib/env";

export default function ProviderDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { profile } = useAuth();
  const { provider, loading, error } = useProviderDetail(slug);
  const { favoriteIds, toggleFavoriteForProvider, locationState } = useDiscoverySession();

  useEffect(() => {
    if (!provider || !isMobileSupabaseConfigured) return;

    void trackAnalyticsEvent(getMobileSupabaseClient(), {
      eventName: "provider_opened",
      actorUserId: profile?.id,
      actorRole: profile?.role,
      providerId: provider.id,
      metadata: {
        surface: "mobile_provider_detail",
        slug: provider.slug,
      },
    }).catch(() => {
      // Discovery should still work even if analytics writes fail.
    });
  }, [profile?.id, profile?.role, provider]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <LoadingBlock label="Loading producer details..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingScreen}>
        <ErrorState description={error} />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.loadingScreen}>
        <EmptyState
          title="Producer not found"
          description="This profile may be inactive, renamed, or unavailable right now."
        />
      </View>
    );
  }

  const distanceMeters = locationState.location
    ? getDistanceMeters(locationState.location, {
        latitude: provider.latitude,
        longitude: provider.longitude,
      })
    : Number.NaN;
  const heroImageUrl = resolveProviderImageUrl(provider.coverImage);

  const trackAction = async (eventName: "navigation_started" | "provider_phone_clicked" | "provider_website_clicked") => {
    if (!isMobileSupabaseConfigured) return;
    try {
      await trackAnalyticsEvent(getMobileSupabaseClient(), {
        eventName,
        actorUserId: profile?.id,
        actorRole: profile?.role,
        providerId: provider.id,
        metadata: {
          slug: provider.slug,
        },
      });
    } catch {
      // Do not block the CTA if analytics cannot be recorded.
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backLabel}>Back to explore</Text>
        </Pressable>

        {provider.images.length > 0 ? (
          <ProviderImageCarousel images={provider.images} />
        ) : heroImageUrl ? (
          <Image source={{ uri: heroImageUrl }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroFallback}>
            <Text style={styles.heroFallbackText}>No gallery uploaded yet</Text>
          </View>
        )}

        <View style={styles.headerBlock}>
          <Text style={styles.title}>{pickLocalizedText(provider.name)}</Text>
          <Text style={styles.meta}>
            {formatDistance(distanceMeters)} • {provider.isOpenNow ? "Open now" : "Currently closed"}
          </Text>
          <ProviderBadgeRow badges={provider.badges} />
          <ProviderCategoryChips categories={provider.categories} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionBody}>
            {pickLocalizedText(provider.description) || "The producer has not added a full profile description yet."}
          </Text>
        </View>

        <View style={styles.ctaGrid}>
          <AppButton
            label="Navigate"
            onPress={() =>
              void (async () => {
                await trackAction("navigation_started");
                await openNavigationRoute(provider.latitude, provider.longitude, pickLocalizedText(provider.name));
              })()
            }
          />
          <AppButton
            label={favoriteIds.includes(provider.id) ? "Saved" : "Save"}
            variant="secondary"
            onPress={() => void toggleFavoriteForProvider(provider.id)}
          />
          {provider.phone ? (
            <AppButton
              label="Call"
              variant="ghost"
              onPress={() =>
                void (async () => {
                  await trackAction("provider_phone_clicked");
                  await openPhoneDialer(provider.phone ?? "");
                })()
              }
            />
          ) : null}
          {provider.website ? (
            <AppButton
              label="Website"
              variant="ghost"
              onPress={() =>
                void (async () => {
                  await trackAction("provider_website_clicked");
                  await openWebsite(provider.website ?? "");
                })()
              }
            />
          ) : null}
        </View>

        {provider.offers.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current offers</Text>
            <View style={styles.offerList}>
              {provider.offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <Text style={styles.offerTitle}>{pickLocalizedText(offer.title)}</Text>
                  <Text style={styles.offerBody}>{pickLocalizedText(offer.body) || "Special seasonal offer."}</Text>
                  {offer.priceLabel ? <Text style={styles.offerMeta}>{offer.priceLabel}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current offers</Text>
            <Text style={styles.sectionBody}>No active offers right now. Check again later for fresh daily updates.</Text>
          </View>
        )}

        {provider.openingHours.length > 0 ? <OpeningHoursBlock hours={provider.openingHours} /> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.sectionBody}>{pickLocalizedText(provider.address) || "Address not published yet."}</Text>
          {provider.phone ? <Text style={styles.contactLine}>Phone: {provider.phone}</Text> : null}
          {provider.email ? <Text style={styles.contactLine}>Email: {provider.email}</Text> : null}
          {provider.website ? <Text style={styles.contactLine}>Website: {provider.website}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: mobileTheme.colors.cream,
  },
  loadingScreen: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
    backgroundColor: mobileTheme.colors.cream,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 32,
    gap: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  backLabel: {
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  heroImage: {
    width: "100%",
    height: 260,
    borderRadius: 26,
    backgroundColor: "#e9e4d8",
  },
  heroFallback: {
    height: 220,
    borderRadius: 26,
    backgroundColor: "#efe8d8",
    alignItems: "center",
    justifyContent: "center",
  },
  heroFallbackText: {
    color: mobileTheme.colors.muted,
    fontWeight: "700",
  },
  headerBlock: {
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: mobileTheme.colors.ink,
  },
  meta: {
    fontSize: 15,
    color: mobileTheme.colors.muted,
  },
  section: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  sectionBody: {
    lineHeight: 21,
    color: mobileTheme.colors.ink,
  },
  ctaGrid: {
    gap: 10,
  },
  offerList: {
    gap: 10,
  },
  offerCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#f5efe0",
    gap: 6,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  offerBody: {
    color: mobileTheme.colors.ink,
    lineHeight: 20,
  },
  offerMeta: {
    color: mobileTheme.colors.forest,
    fontWeight: "700",
  },
  contactLine: {
    color: mobileTheme.colors.ink,
    lineHeight: 20,
  },
});
