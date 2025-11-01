import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ColorValue,
  Dimensions,
  Easing,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Shared colour palette (matches resources page)
const COLORS = {
  background: "#F3E2D4",
  primary: "#C5B0CD",
  secondary: "#415E72",
  textDark: "#17313E",
  white: "#FFFFFF",
  translucentPrimary: "rgba(197, 176, 205, 0.25)",
  translucentSecondary: "rgba(65, 94, 114, 0.06)",
  cardBg: "rgba(255, 255, 255, 0.7)",
  shadow: "rgba(23, 49, 62, 0.12)",
};

type ProblemItem = {
  title: string;
  url: string;
  colors: readonly [ColorValue, ColorValue];
};

const problems: ProblemItem[] = [
  { title: "NeetCode 150 Blind List", url: "https://neetcode.io/practice", colors: [COLORS.primary, COLORS.secondary] },
  { title: "Striver's SDE Sheet", url: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/", colors: [COLORS.secondary, COLORS.primary] },
  { title: "Love Babbar's 450 DSA Questions", url: "https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/", colors: [COLORS.primary, "#9A8EAD"] },
  { title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/grind75", colors: [COLORS.secondary, "#3A5262"] },
  { title: "Sean Prashad LeetCode Patterns", url: "https://seanprashad.com/leetcode-patterns/", colors: [COLORS.primary, COLORS.secondary] },
  { title: "Blind 75 Must Do LeetCode", url: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions", colors: [COLORS.secondary, COLORS.primary] },
  { title: "FAANG Preparation Resources", url: "https://github.com/ombharatiya/FAANG-Coding-Interview-Questions/blob/main/FAANG-Recent-Questions.md", colors: ["#D2BFCF", COLORS.primary] },
  { title: "Grokking the Coding Interview", url: "https://www.educative.io/courses/grokking-the-coding-interview", colors: ["#56778A", COLORS.secondary] },
  { title: "CSES Problem Set", url: "https://cses.fi/problemset/", colors: [COLORS.primary, COLORS.secondary] },
  { title: "LeetCode Top Interview Questions", url: "https://leetcode.com/explore/interview/card/top-interview-questions-easy/", colors: [COLORS.secondary, COLORS.primary] },
  { title: "AlgoMonster Coding Interview Prep", url: "https://algo.monster/", colors: [COLORS.primary, "#A89CB5"] },
  { title: "InterviewBit Programming Topics", url: "https://www.interviewbit.com/courses/programming/", colors: [COLORS.secondary, "#4E6A7C"] },
];

export default function ProblemListScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideUpAnim]);

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Fixed header: stays visible while the list scrolls */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            <Text style={{ color: COLORS.textDark }}>Problem</Text>
            <Text style={{ color: COLORS.secondary }}> List</Text>
          </Text>
        </View>
        {/* <SignedOut>
          <Text style={styles.subtitle}>Curated coding problem collections to boost your skills</Text>
        </SignedOut> */}
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {problems.map((item, index) => (
            <Animated.View
              key={item.title}
              style={[
                styles.problemCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideUpAnim.interpolate({
                        inputRange: [0, 20],
                        outputRange: [0, 20 - index * 4],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity style={styles.cardTouchable} activeOpacity={0.9} onPress={() => openLink(item.url)}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconWrapper}>
                    <MaterialIcons name="code" size={25} color={COLORS.secondary} />
                  </View>
                  <Text style={styles.cardText}>{item.title}</Text>
                </View>

                <View style={styles.chevWrapper}>
                  <MaterialIcons name="chevron-right" size={22} color={COLORS.secondary} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // base container used on mobile and small screens
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 40 : 60,
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  // center and constrain width on web (desktop)
  webContainer: {
    alignSelf: "center",
    width: "70%",
    maxWidth: 920,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginLeft: 8,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 15,
    textAlign: "center",
    maxWidth: 720,
    lineHeight: 22,
  },

  listContainer: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    marginTop: 8,
  },

  problemCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(192, 181, 181, 1)", // match resources page box border color
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTouchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.translucentSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: "600",
  },
  chevWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSpacing: {
    height: 28,
  },
});



