import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const categories: Record<string, string[]> = {
  Sorting: ["Bubble Sort", "Selection Sort", "Insertion Sort"],
  Searching: ["Linear Search", "Binary Search", "Ternary Search"],
  Graph: ["Depth First Search (DFS)", "Breadth First Search (BFS)", "Dijkstra’s Algorithm"],
  "Dynamic Programming (DP)": ["Digit DP", "Longest Increasing Subsequence (LIS)", "Longest Common Subsequence (LCS)"],
  String: ["Rabin-Karp Algorithm", "KMP Algorithm", "Trie"],
};

export default function ResourcesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  const toggleExpand = (category: string) => {
    setExpanded(expanded === category ? null : category);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Algorithm Resources</Text>
      {Object.keys(categories).map((category) => (
        <View key={category} style={styles.card}>
          <TouchableOpacity
            onPress={() => toggleExpand(category)}
            style={styles.categoryHeader}
          >
            <Text style={styles.category}>{category}</Text>
            <MaterialCommunityIcons
              name={expanded === category ? "chevron-up" : "chevron-down"}
              size={24}
              color="#007bff"
            />
          </TouchableOpacity>

          {expanded === category && (
            <View style={styles.algoList}>
              {categories[category].map((algo) => (
                <TouchableOpacity
                  key={algo}
                  style={styles.algoButton}
                  onPress={() =>
                    router.push({ pathname: "/algorithmDetail", params: { title: algo } })
                  }
                >
                  <Text style={styles.algoText}>{algo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8", // A softer background color
    padding: 15,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A237E", // Deep blue for title
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    // Use Platform.select for cross-platform shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
      }
    }),
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007BFF", // Bright blue for category
  },
  algoList: {
    marginTop: 10,
  },
  algoButton: {
    backgroundColor: "#E3F2FD", // Light blue background for buttons
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 8,
  },
  algoText: {
    fontSize: 16,
    color: "#1A237E",
  },
});