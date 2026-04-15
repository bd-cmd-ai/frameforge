import * as Linking from "expo-linking";

export const openNavigationRoute = async (latitude: number, longitude: number, label: string) => {
  const encodedLabel = encodeURIComponent(label);
  await Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving&query=${encodedLabel}`,
  );
};

export const openPhoneDialer = async (phone: string) => {
  await Linking.openURL(`tel:${phone}`);
};

export const openWebsite = async (url: string) => {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  await Linking.openURL(normalized);
};
