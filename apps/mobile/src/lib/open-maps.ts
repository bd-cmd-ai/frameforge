import * as Linking from "expo-linking";

export const openNativeGoogleMaps = async (latitude: number, longitude: number, label: string) => {
  const encodedLabel = encodeURIComponent(label);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedLabel}`;
  await Linking.openURL(url);
};
