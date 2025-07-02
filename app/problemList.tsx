import { SignedOut, useUser } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
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
const isSmallScreen = width < 400;

const COLORS = {
  primary: '#00d2ff',
  secondary: '#3a7bd5',
  darkBg: '#0f172a',
  white: '#ffffff',
  translucentWhite: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.08)',
};

type ProblemItem = {
  title: string;
  url: string;
  colors: readonly [ColorValue, ColorValue];
};

const problems: ProblemItem[] = [
  {
    title: 'Neet Code 150 Blind List',
    url: 'https://neetcode.io/practice?tab=neetcode150',
    colors: ['#00d2ff', '#007bff'] as const,
  },
  {
    title: 'Striver\'s SDE Sheet',
    url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
    colors: ['#00d2ff', '#007bff'] as const,
  },
  {
    title: 'Love\'s 450 Challenge',
    url: 'https://github.com/MithunSanthosh1234/Love-Babbar-Coding-Challenge---450-Python',
    colors: ['#00d2ff', '#007bff'] as const,
  },
  {
    title: 'LeetCode Interview Problems',
    url: 'https://leetcode.com/explore/interview/card/top-interview-questions-easy/',
    colors: ['#00d2ff', '#007bff'] as const,
  },
];

export default function ProblemListScreen() {
  const { user } = useUser();
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>
            <Text style={{ color: COLORS.primary }}>Problem</Text> List
          </Text>
          <SignedOut>
            <Text style={styles.subtitle}>Curated coding problem collections</Text>
          </SignedOut>
        </View>

        <View style={styles.listContainer}>
          {problems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => openLink(item.url)}
              style={styles.cardWrapper}
            >
              <LinearGradient
                colors={item.colors}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.problemCard}
              >
                <MaterialIcons name="code" size={28} color="white" />
                <Text style={styles.cardText}>{item.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <SignedOut>
          <View style={styles.authCard}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Sign In to View More</Text>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SignedOut>
      </ScrollView>
    </LinearGradient>
  );
}



const styles = StyleSheet.create({
  gradient: {
    flex: 1,
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
  },
  listContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginBottom: 30,
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  problemCard: {
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
  },
  cardText: {
    fontWeight: '600',
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
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
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});