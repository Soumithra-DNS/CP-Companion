import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Constants & Data ---

const COLORS = {
  darkBg: '#0f172a',
  primary: '#3A59D1',
  secondary: '#3D90D7',
  accent: '#7AC6D2',
  white: '#FFFFFF',
  translucentWhite: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.08)',
  borderColor: 'rgba(255, 255, 255, 0.2)',
};

// User's original category data - unchanged
const categories: Record<string, string[]> = {
  Sorting: ["Bubble Sort", "Selection Sort", "Insertion Sort"],
  Searching: ["Linear Search", "Binary Search", "Ternary Search"],
  Graph: ["Depth First Search (DFS)", "Breadth First Search (BFS)", "Dijkstra’s Algorithm"],
  "Dynamic Programming (DP)": ["Memoization", "Longest Increasing Subsequence (LIS)", "Longest Common Subsequence (LCS)"],
  String: ["Rabin-Karp Algorithm", "KMP Algorithm", "Trie"],
};

// --- Helper Function ---

const getIconForCategory = (category: string): keyof typeof MaterialIcons.glyphMap => {
  if (category.includes("Sort")) return "sort";
  if (category.includes("Search")) return "search";
  if (category.includes("Graph")) return "hub";
  if (category.includes("Dynamic")) return "insights";
  if (category.includes("String")) return "text-fields";
  return "code";
};

// --- Reusable Category Card Component (Memoized for performance) ---

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
      <TouchableOpacity style={styles.cardHeader} onPress={onHeaderPress} activeOpacity={0.8}>
        <View style={styles.cardTitleContainer}>
          <MaterialIcons name={getIconForCategory(categoryTitle)} size={24} color={COLORS.accent} />
          <Text style={styles.cardTitle}>{categoryTitle}</Text>
        </View>
        <MaterialIcons
          name={isExpanded ? "expand-less" : "expand-more"}
          size={28}
          color={COLORS.white}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.algoList}>
          {algorithms.map((algo) => (
            <TouchableOpacity
              key={algo}
              style={styles.algoButton}
              onPress={() => onAlgoPress(algo)}
            >
              <Text style={styles.algoText}>{algo}</Text>
              <MaterialIcons name="chevron-right" size={22} color={COLORS.translucentWhite} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

// --- Main Screen Component ---

export default function ResourcesPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleCategory = useCallback((categoryTitle: string) => {
    // This creates a smooth expand/collapse animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(current => (current === categoryTitle ? null : categoryTitle));
  }, []);

  const handleAlgoPress = useCallback((algoTitle: string) => {
    router.push({ pathname: "/algorithmDetail" as any, params: { title: algoTitle } });
  }, [router]);

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Algorithm Resources</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.listContainer}>
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
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  algoList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    paddingTop: 5,
    paddingBottom: 10,
  },
  algoButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  algoText: {
    fontSize: 16,
    color: COLORS.translucentWhite,
    flex: 1,
  },
});