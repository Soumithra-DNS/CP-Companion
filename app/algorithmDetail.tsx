import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Linking, 
  ScrollView,
  StatusBar,
  Platform 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import algoDetails from "./algoDetails"; // Import algorithm details

// Define types for our data structures
type AlgorithmDetails = {
  [key: string]: {
    description: string;
    videoId: string;
    problemLink: string;
  };
};

type TicState = {
  algorithm: boolean;
  video: boolean;
  problem: boolean;
  counted: boolean;
};

type TicType = keyof Omit<TicState, 'counted'>;

// Updated color palette
const COLORS = {
  darkBg: '#0f172a',
  primary: '#402E7A',    // Deep purple
  secondary: '#4C3BCF',  // Purple
  accent1: '#4B70F5',    // Blue
  accent2: '#3DC2EC',    // Light blue
  white: '#FFFFFF',
  translucentWhite: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.08)',
  borderColor: 'rgba(255, 255, 255, 0.2)',
  success: '#4CAF50',
  warning: '#FF5722',
};

export default function AlgorithmDetail() {
  const { title } = useLocalSearchParams();
  // Ensure title is a string by taking the first element if it's an array
  const titleString = Array.isArray(title) ? title[0] : title || '';
  const algo = (algoDetails as AlgorithmDetails)[titleString];
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState("Algorithm");
  const [selectedTics, setSelectedTics] = useState<TicState>({
    algorithm: false,
    video: false,
    problem: false,
    counted: false,
  });

  useEffect(() => {
    const loadTics = async () => {
      try {
        const savedTics = await AsyncStorage.getItem(`tic-${titleString}`);
        if (savedTics) {
          setSelectedTics(JSON.parse(savedTics));
        }
      } catch (error) {
        console.error("Failed to load tics:", error);
      }
    };
    loadTics();
  }, [titleString]);

  const handleTic = async (type: TicType) => {
    const updatedTics = { ...selectedTics, [type]: !selectedTics[type] };
    setSelectedTics(updatedTics);
    try {
      await AsyncStorage.setItem(`tic-${titleString}`, JSON.stringify(updatedTics));

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
      await AsyncStorage.setItem(`tic-${titleString}`, JSON.stringify(updatedTics));
    } catch (error) {
      console.error("Failed to update and save progress:", error);
    }
  };

  if (!algo) {
    return (
      <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Algorithm not found!</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      
      {/* Custom Header - No Back Button */}
      <View style={styles.header}>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{titleString}</Text>

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
              <TouchableOpacity 
                onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${algo.videoId}`)}
                style={styles.linkButton}
              >
                <LinearGradient 
                  colors={[COLORS.accent1, COLORS.accent2]} 
                  style={styles.linkGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="ondemand-video" size={24} color={COLORS.white} />
                  <Text style={styles.linkText}>Watch Video Tutorial</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Text style={styles.contentText}>No video available yet.</Text>
            )
          )}

          {selectedTab === "Problem" && (
            algo.problemLink ? (
              <TouchableOpacity 
                onPress={() => Linking.openURL(algo.problemLink)}
                style={styles.linkButton}
              >
                <LinearGradient 
                  colors={[COLORS.primary, COLORS.secondary]} 
                  style={styles.linkGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="code" size={24} color={COLORS.white} />
                  <Text style={styles.linkText}>Solve Practice Problem</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Text style={styles.contentText}>No problem available yet.</Text>
            )
          )}
        </View>

        <View style={styles.ticRow}>
          {(["algorithm", "video", "problem"] as TicType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => handleTic(type)}
              style={styles.ticContainer}
            >
              <LinearGradient 
                colors={selectedTics[type] ? [COLORS.success, '#3d8b40'] : [COLORS.warning, '#e64a19']} 
                style={styles.ticGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AntDesign
                  name={selectedTics[type] ? "checkcircle" : "checkcircleo"}
                  size={24}
                  color={COLORS.white}
                />
                <Text style={styles.ticText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Completion Progress</Text>
          <View style={styles.progressBar}>
            <LinearGradient 
              colors={[COLORS.accent1, COLORS.accent2]} 
              style={[
                styles.progressFill, 
                { 
                  width: `${((selectedTics.algorithm ? 1 : 0) + 
                            (selectedTics.video ? 1 : 0) + 
                            (selectedTics.problem ? 1 : 0)) / 3 * 100}%` 
                }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          <Text style={styles.progressPercent}>
            {Math.round(((selectedTics.algorithm ? 1 : 0) + 
                        (selectedTics.video ? 1 : 0) + 
                        (selectedTics.problem ? 1 : 0)) / 3 * 100)}% Complete
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight) : 20,
  },
  logoIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontWeight: '600',
    color: COLORS.white,
  },
  activeTabText: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
      }
    }),
  },
  contentText: {
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 24,
  },
  linkButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  linkGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 10,
  },
  ticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  ticContainer: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ticGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticText: {
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
    marginTop: 5,
  },
  progressContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 14,
    color: COLORS.accent2,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 50,
  },
});