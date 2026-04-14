import { SafeAreaView, ScrollView, StyleSheet, Text, View, type PropsWithChildren } from "react-native";
import { mobileTheme } from "../constants/theme";

interface AppScreenProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  scrollable?: boolean;
}

export const AppScreen = ({ children, title, subtitle, scrollable = true }: AppScreenProps) => {
  const content = (
    <View style={styles.inner}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scrollable ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: mobileTheme.colors.cream,
  },
  scroll: {
    paddingBottom: 28,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  subtitle: {
    fontSize: 15,
    color: mobileTheme.colors.muted,
    lineHeight: 22,
  },
});
