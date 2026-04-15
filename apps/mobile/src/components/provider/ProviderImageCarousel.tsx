import { Dimensions, Image, ScrollView, StyleSheet, View } from "react-native";
import type { ProviderImage } from "@radar-domace/types";
import { resolveProviderImageUrl } from "../../lib/formatting/provider-image";

const slideWidth = Dimensions.get("window").width - 36;

export const ProviderImageCarousel = ({ images }: { images: ProviderImage[] }) => (
  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    {images.map((image) => (
      <View key={image.id} style={styles.slide}>
        <Image source={{ uri: resolveProviderImageUrl(image.path) }} style={styles.image} />
      </View>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  row: {
    gap: 12,
  },
  slide: {
    width: slideWidth,
    maxWidth: slideWidth,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 24,
  },
});
