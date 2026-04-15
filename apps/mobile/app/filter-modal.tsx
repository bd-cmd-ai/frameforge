import { SafeAreaView, StyleSheet } from "react-native";
import { ErrorState } from "../src/components/StatefulPanel";
import { LoadingBlock } from "../src/components/explore/LoadingBlock";
import { FilterSheet } from "../src/components/explore/FilterSheet";
import { mobileTheme } from "../src/constants/theme";
import { useCategories } from "../src/hooks/providers/useCategories";
import { useDiscoverySession } from "../src/hooks/providers/useDiscoverySession";

export default function FilterModal() {
  const { categories, loading, error } = useCategories();
  const { filters, setFilters, resetFilters } = useDiscoverySession();

  return (
    <SafeAreaView style={styles.screen}>
      {loading ? <LoadingBlock label="Loading filter options..." /> : null}
      {error ? <ErrorState description={error} /> : null}
      {!loading && !error ? (
        <FilterSheet filters={filters} categories={categories} onChange={setFilters} onReset={resetFilters} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: mobileTheme.colors.cream,
  },
});
