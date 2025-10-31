import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import algoDetails from "./algoDetails";

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

type TicType = keyof Omit<TicState, "counted">;

const COLORS = {
  background: "#F3E2D4",
  primary: "#C5B0CD",
  secondary: "#415E72",
  textDark: "#17313E",
  accent: "#A78FAF",
  accentLight: "#DCC8F0",
  cardBg: "rgba(255, 255, 255, 0.7)",
  white: "#FFFFFF",
  lightCream: "#FAF5F0",
  mediumCream: "#E8D5C4",
  darkCream: "#D4C1A8",
  translucentPrimary: "rgba(197, 176, 205, 0.3)",
  translucentSecondary: "rgba(65, 94, 114, 0.1)",
  borderColor: "rgba(197, 176, 205, 0.4)",
  algoTextLight: "rgba(23, 49, 62, 0.8)",
  shadow: "rgba(23, 49, 62, 0.15)",
  success: "#38A169",
  linkBlue: "#3182CE",
  linkBlueLight: "#63B3ED",
  // গাঢ় বেগুনি কালার এড করুন
  darkPurple: "#8B78A1",
};

export default function AlgorithmDetail() {
  const { title } = useLocalSearchParams();
  const titleString = Array.isArray(title) ? title[0] : title || "";
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
      await AsyncStorage.setItem(
        `tic-${titleString}`,
        JSON.stringify(updatedTics)
      );

      const allDone =
        updatedTics.algorithm && updatedTics.video && updatedTics.problem;
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
      await AsyncStorage.setItem(
        `tic-${titleString}`,
        JSON.stringify(updatedTics)
      );
    } catch (error) {
      console.error("Failed to update and save progress:", error);
    }
  };

  if (!algo) {
    return (
      <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Algorithm not found!</Text>
      </View>
    );
  }

  const progressPercentage = Math.round(
    ((selectedTics.algorithm ? 1 : 0) +
      (selectedTics.video ? 1 : 0) +
      (selectedTics.problem ? 1 : 0)) /
      3 *
    100
  );

  const renderChecklistItem = (type: TicType, text: string) => (
    <TouchableOpacity
      onPress={() => handleTic(type)}
      style={styles.checklistItem}
      activeOpacity={0.6}
    >
      <View style={styles.checkboxContainer}>
        <MaterialIcons
          name={selectedTics[type] ? "check-circle" : "radio-button-unchecked"}
          size={26}
          color={selectedTics[type] ? COLORS.success : COLORS.secondary}
        />
      </View>
      <Text
        style={[
          styles.checkText,
          selectedTics[type] && styles.checkTextDone,
        ]}
      >
        {text}
      </Text>
      {selectedTics[type] && (
        <MaterialIcons 
          name="check" 
          size={18} 
          color={COLORS.success} 
          style={styles.checkmark}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title={titleString} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabContainer}>
          {["Algorithm", "Video", "Problem"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.activeTabButton,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <MaterialIcons
                  name={
                    tab === "Algorithm" ? "description" :
                    tab === "Video" ? "ondemand-video" : "code"
                  }
                  size={20}
                  color={selectedTab === tab ? COLORS.white : COLORS.secondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {selectedTab === "Algorithm" ? "Algorithm Overview" :
               selectedTab === "Video" ? "Video Tutorial" : "Practice Problem"}
            </Text>

          </View>

          {selectedTab === "Algorithm" && (
            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>
                {algo.description || "No description available yet."}
              </Text>
            </View>
          )}

          {selectedTab === "Video" &&
            (algo.videoId ? (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    `https://www.youtube.com/watch?v=${algo.videoId}`
                  )
                }
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["rgba(192, 163, 225, 1)", "rgba(125, 77, 180, 1)"]}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.actionText}>Watch Video Tutorial</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholderContainer}>
                <MaterialIcons name="video-library" size={48} color={COLORS.translucentPrimary} />
                <Text style={styles.placeholderText}>No video available yet</Text>
              </View>
            ))}

          {selectedTab === "Problem" &&
            (algo.problemLink ? (
                <TouchableOpacity
                onPress={() => Linking.openURL(algo.problemLink)}
                style={styles.actionButton}
                activeOpacity={0.7}
                >
                <LinearGradient
                  colors={["rgba(192, 163, 225, 1)", "rgba(125, 77, 180, 1)"]}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.actionText}>Solve Practice Problem</Text>
                </LinearGradient>
                </TouchableOpacity>
            ) : (
              <View style={styles.placeholderContainer}>
                <MaterialIcons name="code" size={48} color={COLORS.translucentPrimary} />
                <Text style={styles.placeholderText}>No practice problem available</Text>
              </View>
            ))}
        </View>

        {/* Progress Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Learning Progress</Text>
            <View style={styles.progressIndicator}>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
            </View>
          </View>

          <View style={styles.checklistContainer}>
            {renderChecklistItem("algorithm", "Read Algorithm Explanation")}
            {renderChecklistItem("video", "Watched Video Tutorial")}
            {renderChecklistItem("problem", "Solved Practice Problem")}
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={["rgba(234, 226, 243, 1)", "rgba(149, 98, 208, 1)"]}
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0%</Text>
              <Text style={styles.progressLabel}>50%</Text>
              <Text style={styles.progressLabel}>100%</Text>
            </View>
          </View>

          {progressPercentage === 100 && (
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>Topic Completed</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const Header = ({ title }: { title: string }) => {
  const router = useRouter();
  return (
    <View style={styles.header}>

      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F3E2D4",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? Number(StatusBar.currentHeight) || 20 : 60,
    paddingBottom: 16,
    backgroundColor: "#F3E2D4",
    borderBottomWidth: 0.2,
    borderBottomColor: COLORS.borderColor,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    backgroundColor: "rgba(65, 94, 114, 0.1)",
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: "#17313E",
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    marginBottom: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    shadowColor: "rgba(23, 49, 62, 0.15)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: "rgba(135, 94, 181, 1)",
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#415E72",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    shadowColor: "rgba(23, 49, 62, 0.15)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#17313E",
  },
  contentContainer: {
    paddingTop: 4,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: "rgba(23, 49, 62, 0.8)",
    fontWeight: "500",
  },
  actionButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 14,
  },
  actionText: {
    fontSize: 16,
    color: "#ffffffff",
    fontWeight: "600",
    marginLeft: 10,
  },
  placeholderContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "rgba(197, 176, 205, 0.3)",
    marginTop: 12,
    fontWeight: "500",
  },
  checklistContainer: {
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkText: {
    fontSize: 16,
    color: "#17313E",
    fontWeight: "500",
    flex: 1,
  },
  checkTextDone: {
    color: "#38A169",
  },
  checkmark: {
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(65, 94, 114, 0.1)",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(23, 49, 62, 0.8)",
    fontWeight: "500",
  },
  progressIndicator: {
    backgroundColor: "rgba(65, 94, 114, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressPercentage: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(135, 94, 181, 1)",
  },
  completionBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 161, 105, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 161, 105, 0.2)",
  },
  completionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#38A169",
  },
  errorText: {
    fontSize: 22,
    color: "#000000ff",
    textAlign: "center",
    fontWeight: "600",
  },
});
