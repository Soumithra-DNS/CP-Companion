import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

// Removed duplicate ProgressScreen component and its styles.

export default function ProgressPage() {
  const [learnedTopics, setLearnedTopics] = useState(0);

  const loadData = async () => {
    try {
      const savedLearned = await AsyncStorage.getItem("learnedTopics");
      setLearnedTopics(savedLearned ? parseInt(savedLearned, 10) : 0);
    } catch (error) {
      console.error("Failed to load progress data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {};
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Progress</Text>

      <View style={styles.card}>
        <MaterialIcons name="done-all" size={40} color="#4CAF50" />
        <Text style={styles.cardTitle}>Learned Topics</Text>
        <Text style={styles.cardValue}>{learnedTopics}</Text>
      </View>

      <View style={styles.card}>
        <MaterialIcons name="trending-up" size={40} color="#FF9800" />
        <Text style={styles.cardTitle}>Total Topics</Text>
        <Text style={styles.cardValue}>15</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8", padding: 20 },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 25, color: "#1A237E", textAlign: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 3px 5px rgba(0,0,0,0.1)",
      }
    }),
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#007BFF", marginTop: 15 },
  cardValue: { fontSize: 32, fontWeight: "bold", color: "#1A237E" },
});