import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  background: "#F3E2D4",
  primary: "#C5B0CD",
  secondary: "#415E72",
  textDark: "#17313E",
  accent: "#A78FAF",
  white: "#FFFFFF",
  lightCream: "#FAF5F0",
  mediumCream: "#E8D5C4",
  darkCream: "#D4C1A8",
  translucentPrimary: "rgba(197, 176, 205, 0.3)",
  translucentSecondary: "rgba(65, 94, 114, 0.1)",
  cardBg: "rgba(255, 255, 255, 0.7)",
  borderColor: "rgba(197, 176, 205, 0.4)",
  algoTextLight: "rgba(23, 49, 62, 0.8)",
  shadow: "rgba(23, 49, 62, 0.15)",
};

const categories: Record<string, string[]> = {
  Sorting: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort"],
  Searching: ["Linear Search", "Binary Search", "Ternary Search", "Jump Search"],
  Graph: ["Depth First Search (DFS)", "Breadth First Search (BFS)", "Dijkstra's Algorithm", "A* Algorithm"],
  "Dynamic Programming": ["Memoization", "Tabulation", "Longest Increasing Subsequence", "Longest Common Subsequence"],
  String: ["Rabin-Karp Algorithm", "KMP Algorithm", "Trie", "Suffix Array"],
  "Data Structures": ["Arrays", "Linked Lists", "Trees", "Hash Tables", "Heaps"],
};

const getIconForCategory = (category: string): string => {
  if (category.includes("Sort")) return "sort";
  if (category.includes("Search")) return "search";
  if (category.includes("Graph")) return "hub";
  if (category.includes("Dynamic")) return "trending-up";
  if (category.includes("String")) return "text-fields";
  if (category.includes("Data")) return "storage";
  return "code";
};

type CategoryCardProps = {
  categoryTitle: string;
  algorithms: string[];
  isExpanded: boolean;
  onHeaderPress: () => void;
  onAlgoPress: (algo: string) => void;
};

const CategoryCard = React.memo(({ categoryTitle, algorithms, isExpanded, onHeaderPress, onAlgoPress }: CategoryCardProps) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={[
          styles.cardHeader, 
          isExpanded && styles.cardHeaderExpanded
        ]} 
        onPress={onHeaderPress} 
        activeOpacity={0.7}
      >
        <View style={styles.cardTitleContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons 
              name={getIconForCategory(categoryTitle) as any} 
              size={22} 
              color={COLORS.secondary} 
            />
          </View>
          <Text style={styles.cardTitle}>{categoryTitle}</Text>
        </View>
        <View style={styles.expandIconContainer}>
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={26} 
            color={COLORS.secondary} 
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.algoList}>
          {algorithms.map((algo, index) => (
            <TouchableOpacity 
              key={algo} 
              style={[
                styles.algoButton,
                index === algorithms.length - 1 && styles.lastAlgoButton
              ]} 
              onPress={() => onAlgoPress(algo)}
              activeOpacity={0.6}
            >
              <View style={styles.algoContent}>
                <View style={styles.algoBullet} />
                <Text style={styles.algoText}>{algo}</Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={20} 
                color={COLORS.secondary} 
                style={styles.chevron} 
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

export default function ResourcesPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Sorting");
  const router = useRouter();

  const handleToggleCategory = useCallback((categoryTitle: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((current) => (current === categoryTitle ? null : categoryTitle));
  }, []);

  const handleAlgoPress = useCallback((algoTitle: string) => {
    router.push(`/algorithmDetail?title=${encodeURIComponent(algoTitle)}`);
  }, [router]);

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>
              <Text style={{ color: COLORS.textDark }}>Algorithm</Text>
              <Text style={{ color: COLORS.secondary }}> Resources</Text>
            </Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.listContainer}
        >
          {Object.entries(categories).map(([categoryTitle, algorithms]) => (
            <CategoryCard
              key={categoryTitle}
              categoryTitle={categoryTitle}
              algorithms={algorithms}
              isExpanded={expandedCategory === categoryTitle}
              onHeaderPress={() => handleToggleCategory(categoryTitle)}
              onAlgoPress={handleAlgoPress}
            />
          ))}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 40 : 60,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  titleContainer: {
    // kept for backward compatibility (not used after headerRow change)
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: 0.2,
    textAlign: "left",
  },
  pageTitleAccent: {
    // kept to allow explicit accent usage elsewhere
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(192, 181, 181, 1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(132, 127, 127, 0.2)",
  },
  cardHeaderExpanded: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.translucentPrimary,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.translucentSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
    flex: 1,
  },
  expandIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.translucentSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  algoList: {
    backgroundColor: COLORS.lightCream,
  },
  algoButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(181, 159, 191, 0.15)",
  },
  lastAlgoButton: {
    borderBottomWidth: 0,
  },
  algoContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  algoBullet: {
    width: 8,
    height: 8,
    borderRadius: 16,
    backgroundColor: "rgba(108, 102, 102, 1)",
    marginRight: 16,
  },
  algoText: {
    fontSize: 16,
    color: COLORS.algoTextLight,
    flex: 1,
    fontWeight: "500",
  },
  chevron: {
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 20,
  },
});