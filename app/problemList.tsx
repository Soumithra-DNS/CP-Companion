// app/problemList.tsx

import { SignedOut, useUser } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ColorValue,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#3A59D1',
  secondary: '#3D90D7',
  accent1: '#7AC6D2',
  accent2: '#B5FCCD',
  darkBg: '#0f172a',
  white: '#ffffff',
  translucentWhite: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.08)',
  inputBorder: 'rgba(255, 255, 255, 0.2)',
};

type ProblemItem = {
  title: string;
  url: string;
  colors: readonly [ColorValue, ColorValue];
};

const problems: ProblemItem[] = [
  {
    title: 'NeetCode 150 Blind List',
    url: 'https://neetcode.io/practice',
    colors: [COLORS.primary, COLORS.secondary],
  },
  {
    title: "Striver's SDE Sheet",
    url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
    colors: [COLORS.secondary, COLORS.accent1],
  },
  {
    title: "Love Babbar's 450 DSA Questions",
    url: 'https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/',
    colors: [COLORS.accent1, COLORS.accent2],
  },
  {
    title: 'Tech Interview Handbook',
    url: 'https://www.techinterviewhandbook.org/grind75',
    colors: [COLORS.primary, COLORS.accent2],
  },
  {
    title: 'Sean Prashad LeetCode Patterns',
    url: 'https://seanprashad.com/leetcode-patterns/',
    colors: [COLORS.secondary, COLORS.accent2],
  },
  {
    title: 'Blind 75 Must Do LeetCode',
    url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions',
    colors: [COLORS.primary, COLORS.accent1],
  },
  {
    title: 'FAANG Preparation Resources',
    url: 'https://github.com/ombharatiya/FAANG-Coding-Interview-Questions',
    colors: [COLORS.accent1, COLORS.secondary],
  },
  {
    title: 'Grokking the Coding Interview',
    url: 'https://www.educative.io/courses/grokking-the-coding-interview',
    colors: [COLORS.secondary, COLORS.accent2],
  },
  {
    title: 'CSES Problem Set',
    url: 'https://cses.fi/problemset/',
    colors: [COLORS.primary, COLORS.accent1],
  },
  {
    title: 'LeetCode Top Interview Questions',
    url: 'https://leetcode.com/explore/interview/card/top-interview-questions-easy/',
    colors: [COLORS.accent1, COLORS.accent2],
  },
  {
    title: 'AlgoMonster Coding Interview Prep',
    url: 'https://algo.monster/',
    colors: [COLORS.secondary, COLORS.primary],
  },
  {
    title: 'InterviewBit Programming Topics',
    url: 'https://www.interviewbit.com/courses/programming/',
    colors: [COLORS.primary, COLORS.accent2],
  },
];

export default function ProblemListScreen() {
  const { user } = useUser();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          <View style={styles.headerRow}>
            <MaterialIcons name="code" size={38} color={COLORS.primary} style={styles.logoIcon} />
            <Text style={styles.title}>
              <Text style={{ color: COLORS.primary }}>Problem</Text>
              <Text style={{ color: COLORS.white }}> List</Text>
            </Text>
          </View>
          <SignedOut>
            <Text style={styles.subtitle}>
              Curated coding problem collections to boost your skills
            </Text>
          </SignedOut>
        </Animated.View>

        {/* Problem Cards */}
        <View style={styles.listContainer}>
          {problems.map((item, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideUpAnim.interpolate({
                      inputRange: [0, 20],
                      outputRange: [0, 20 - index * 5],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity onPress={() => openLink(item.url)} activeOpacity={0.8}>
                <LinearGradient colors={item.colors} start={[0, 0]} end={[1, 1]} style={styles.problemCard}>
                  <View style={styles.iconWrapper}>
                    <MaterialIcons name="code" size={28} color={COLORS.white} />
                  </View>
                  <Text style={styles.cardText}>{item.title}</Text>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.white} style={styles.arrowIcon} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Call to Sign In */}
        <SignedOut>
          <Animated.View style={[styles.authCard, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Sign In to Track Progress</Text>
              <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SignedOut>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  logoIcon: { marginRight: 2 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.translucentWhite,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 350,
    lineHeight: 24,
  },
  listContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginBottom: 30,
    gap: 16,
  },
  problemCard: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  iconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 18,
    color: COLORS.white,
  },
  arrowIcon: { marginLeft: 8 },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  footerText: {
    color: COLORS.translucentWhite,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.accent1,
    fontWeight: '600',
    fontSize: 14,
  },
});