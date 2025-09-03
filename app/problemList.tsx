import { SignedOut, useUser } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ColorValue,
  Dimensions,
  Easing,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// ======================= পরিবর্তন শুরু (Start of Changes) =======================

// আপনার দেওয়া কালার প্যালেট: https://colorhunt.co/palette/f3e2d4c5b0cd415e7217313e
// এই কালারগুলো ব্যবহার করে কোডটি আপডেট করা হয়েছে।
const COLORS = {
  background: '#F3E2D4', // Peach (পেজর ব্যাকগ্রাউন্ড)
  primary: '#C5B0CD',    // Lavender (প্রধান রঙ)
  secondary: '#415E72',  // Blue-Gray (দ্বিতীয় প্রধান রঙ)
  textDark: '#17313E',   // Dark Navy (লেখার রঙ)
  white: '#FFFFFF',
  translucentPrimary: 'rgba(197, 176, 205, 0.25)',
  translucentSecondary: 'rgba(65, 94, 114, 0.4)',
};

type ProblemItem = {
  title: string;
  url: string;
  colors: readonly [ColorValue, ColorValue];
};

// প্রতিটি বক্সের জন্য নতুন এবং আকর্ষণীয় গ্রেডিয়েন্ট কালার সেট করা হয়েছে।
const problems: ProblemItem[] = [
  { title: 'NeetCode 150 Blind List', url: 'https://neetcode.io/practice', colors: [COLORS.primary, COLORS.secondary] },
  { title: "Striver's SDE Sheet", url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', colors: [COLORS.secondary, COLORS.primary] },
  { title: "Love Babbar's 450 DSA Questions", url: 'https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/', colors: [COLORS.primary, '#9A8EAD'] }, // A slightly darker shade of primary for variation
  { title: 'Tech Interview Handbook', url: 'https://www.techinterviewhandbook.org/grind75', colors: [COLORS.secondary, '#3A5262'] }, // A slightly darker shade of secondary
  { title: 'Sean Prashad LeetCode Patterns', url: 'https://seanprashad.com/leetcode-patterns/', colors: [COLORS.primary, COLORS.secondary] },
  { title: 'Blind 75 Must Do LeetCode', url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions', colors: [COLORS.secondary, COLORS.primary] },
  { title: 'FAANG Preparation Resources', url: 'https://github.com/ombharatiya/FAANG-Coding-Interview-Questions/blob/main/FAANG-Recent-Questions.md', colors: ['#D2BFCF', COLORS.primary] }, // A slightly lighter shade of primary
  { title: 'Grokking the Coding Interview', url: 'https://www.educative.io/courses/grokking-the-coding-interview', colors: ['#56778A', COLORS.secondary] }, // A slightly lighter shade of secondary
  { title: 'CSES Problem Set', url: 'https://cses.fi/problemset/', colors: [COLORS.primary, COLORS.secondary] },
  { title: 'LeetCode Top Interview Questions', url: 'https://leetcode.com/explore/interview/card/top-interview-questions-easy/', colors: [COLORS.secondary, COLORS.primary] },
  { title: 'AlgoMonster Coding Interview Prep', url: 'https://algo.monster/', colors: [COLORS.primary, '#A89CB5'] },
  { title: 'InterviewBit Programming Topics', url: 'https://www.interviewbit.com/courses/programming/', colors: [COLORS.secondary, '#4E6A7C'] },
];

// ======================== পরিবর্তন শেষ (End of Changes) ========================


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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
          <View style={styles.headerRow}>
            <MaterialIcons name="code" size={38} color={COLORS.textDark} style={styles.logoIcon} />
            <Text style={styles.title}>
              <Text style={{ color: COLORS.textDark }}>Problem</Text>
              <Text style={{ color: COLORS.secondary }}> List</Text>
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
              <TouchableOpacity onPress={() => openLink(item.url)} activeOpacity={0.9}>
                <LinearGradient colors={item.colors} start={[0, 0]} end={[1, 1]} style={styles.problemCard}>
                  <View style={styles.iconWrapper}>
                    {/* আইকনের কালার এখানে পরিবর্তন করা হয়েছে যাতে এটি নতুন ব্যাকগ্রাউন্ডের সাথে ভালো দেখায় */}
                    <MaterialIcons name="code" size={26} color={COLORS.secondary} />
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
              activeOpacity={0.85}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background // ব্যাকগ্রাউন্ড কালার অপরিবর্তিত
  },
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
    color: COLORS.textDark,
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.secondary,
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
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  iconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // আইকনের ব্যাকগ্রাউন্ড একটু স্বচ্ছ করা হয়েছে
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 17,
    color: COLORS.white, // লেখার কালার সাদা করা হয়েছে, কারণ ব্যাকগ্রাউন্ড এখন ডার্ক
  },
  arrowIcon: { marginLeft: 8 },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.translucentPrimary,
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.translucentSecondary,
  },
  button: {
    backgroundColor: COLORS.textDark,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
    color: COLORS.secondary,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.textDark,
    fontWeight: '600',
    fontSize: 14,
  },
});