import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { createAnalyticsClient } from "@radar-domace/analytics";
import { providerApi } from "@radar-domace/api";
import type { ProviderDetail } from "@radar-domace/types";
import { AppButton } from "../../src/components/AppButton";
import { AppScreen } from "../../src/components/AppScreen";
import { ErrorState, LoadingState } from "../../src/components/StatefulPanel";
import { StatusBadge } from "../../src/components/StatusBadge";
import { openNativeGoogleMaps } from "../../src/lib/open-maps";

const analytics = createAnalyticsClient();

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providerApi.getProvider(id).then((response) => {
      setProvider(response);
      setLoading(false);
      if (response) {
        analytics.track({ eventName: "provider_opened", actorRole: "consumer", providerId: response.id });
      }
    });
  }, [id]);

  if (loading) {
    return (
      <AppScreen>
        <LoadingState label="Loading producer details..." />
      </AppScreen>
    );
  }

  if (!provider) {
    return (
      <AppScreen>
        <ErrorState description="This producer could not be found." />
        <AppButton label="Back to explore" onPress={() => router.replace("/(tabs)/explore")} />
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={{ uri: provider.coverImage ?? undefined }} style={styles.hero} />
        <Text style={styles.title}>{provider.name.sl}</Text>
        <Text style={styles.address}>{provider.address.sl}</Text>
        <View style={styles.badges}>
          {provider.badges.map((badge) => (
            <StatusBadge key={badge} badge={badge} />
          ))}
        </View>
        <Text style={styles.body}>{provider.description.sl}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today’s offers</Text>
          {provider.offers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <Text style={styles.offerTitle}>{offer.title.sl}</Text>
              <Text style={styles.offerBody}>{offer.body.sl}</Text>
              {offer.priceLabel ? <Text style={styles.offerMeta}>{offer.priceLabel}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opening hours</Text>
          {provider.openingHours.map((item) => (
            <View key={item.id} style={styles.hourRow}>
              <Text style={styles.hourLabel}>Day {item.dayOfWeek}</Text>
              <Text style={styles.hourValue}>{item.isClosed ? "Closed" : `${item.opensAt} – ${item.closesAt}`}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <AppButton
          label="Start navigation"
          onPress={async () => {
            await analytics.track({
              eventName: "navigation_started",
              actorRole: "consumer",
              providerId: provider.id,
            });
            await openNativeGoogleMaps(provider.latitude, provider.longitude, provider.name.sl);
          }}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: 14,
    paddingBottom: 120,
  },
  hero: {
    width: "100%",
    height: 220,
    borderRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#142013",
  },
  address: {
    fontSize: 14,
    color: "#627063",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: "#142013",
  },
  section: {
    gap: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#fffdf7",
    borderWidth: 1,
    borderColor: "#d8d0c0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#142013",
  },
  offerCard: {
    gap: 6,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#f3efe4",
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#142013",
  },
  offerBody: {
    fontSize: 14,
    lineHeight: 20,
    color: "#627063",
  },
  offerMeta: {
    fontSize: 14,
    color: "#2e5b2c",
    fontWeight: "700",
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hourLabel: {
    color: "#627063",
  },
  hourValue: {
    color: "#142013",
    fontWeight: "700",
  },
  ctaBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
  },
});
