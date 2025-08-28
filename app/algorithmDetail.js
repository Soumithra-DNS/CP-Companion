import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons"; // For tic icons
import algoDetails from "../app/algoDetails"; // Import algorithm details

export default function AlgorithmDetail() {
  const { title } = useLocalSearchParams();
  const algo = algoDetails[title];
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState("Algorithm");
  const [selectedTics, setSelectedTics] = useState({
    algorithm: false,
    video: false,
    problem: false,
    counted: false,
  });

  useEffect(() => {
    const loadTics = async () => {
      try {
        const savedTics = await AsyncStorage.getItem(`tic-${title}`);
        if (savedTics) {
          setSelectedTics(JSON.parse(savedTics));
        }
      } catch (error) {
        console.error("Failed to load tics:", error);
      }
    };
    loadTics();
  }, [title]);

  const handleTic = async (type) => {
    const updatedTics = { ...selectedTics, [type]: !selectedTics[type] };
    setSelectedTics(updatedTics);
    try {
      await AsyncStorage.setItem(`tic-${title}`, JSON.stringify(updatedTics));

      const allDone = updatedTics.algorithm && updatedTics.video && updatedTics.problem;
      let newLearnedTopics = 0;
      const savedLearned = await AsyncStorage.getItem("learnedTopics");
      let currentLearned = savedLearned ? parseInt(savedLearned) : 0;

      if (allDone && !updatedTics.counted) {
        newLearnedTopics = currentLearned + 1;
        updatedTics.counted = true;
      } else if (!allDone && updatedTics.counted) {
        newLearnedTopics = Math.max(currentLearned - 1, 0);
        updatedTics.counted = false;
      } else {
        newLearnedTopics = currentLearned;
      }

      await AsyncStorage.setItem("learnedTopics", newLearnedTopics.toString());
      await AsyncStorage.setItem(`tic-${title}`, JSON.stringify(updatedTics)); // Save final state
    } catch (error) {
      console.error("Failed to update and save progress:", error);
    }
  };

  if (!algo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Algorithm not found!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <AntDesign name="arrowleft" size={24} color="#007bff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.tabRow}>
        {["Algorithm", "Video", "Problem"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        {selectedTab === "Algorithm" && (
          <Text style={styles.contentText}>{algo.description || "No description available yet."}</Text>
        )}

        {selectedTab === "Video" && (
          algo.videoId ? (
            <TouchableOpacity onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${algo.videoId}`)}>
              <Text style={styles.linkText}>Watch Video ↗</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.contentText}>No video available yet.</Text>
          )
        )}

        {selectedTab === "Problem" && (
          algo.problemLink ? (
            <TouchableOpacity onPress={() => Linking.openURL(algo.problemLink)}>
              <Text style={styles.linkText}>Solve Problem ↗</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.contentText}>No problem available yet.</Text>
          )
        )}
      </View>

      <View style={styles.ticRow}>
        {["algorithm", "video", "problem"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => handleTic(type)}
            style={[
              styles.ticButton,
              selectedTics[type] ? styles.ticChecked : styles.ticUnchecked,
            ]}
          >
            <AntDesign
              name={selectedTics[type] ? "checkcircle" : "checkcircleo"}
              size={24}
              color="#fff"
            />
            <Text style={styles.ticText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F0F4F8" },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backText: { fontSize: 18, color: "#007BFF", fontWeight: "600", marginLeft: 5 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A237E", textAlign: "center", marginBottom: 25 },
  tabRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
  },
  activeTab: { backgroundColor: "#007BFF" },
  tabText: { fontWeight: "600", color: "#1A237E" },
  activeTabText: { color: "#fff" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  contentText: { fontSize: 16, color: "#333", lineHeight: 24 },
  linkText: { fontSize: 16, color: "#007BFF", fontWeight: "600" },
  ticRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  ticButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ticChecked: { backgroundColor: "#4CAF50" },
  ticUnchecked: { backgroundColor: "#FF5722" },
  ticText: { fontWeight: "600", color: "#fff", textTransform: "capitalize", marginTop: 5 },
  errorText: { fontSize: 18, color: "#D32F2F", textAlign: "center", marginTop: 50 },
});