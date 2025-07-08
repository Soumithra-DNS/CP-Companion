import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
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

type Feature = {
  label: string;
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  colors: readonly [string, string];
};

const mainFeatures: Feature[] = [
  { label: 'Resources', route: '/resources', icon: 'menu-book', colors: ['#00d2ff', '#007bff'] },
  { label: 'Problem List', route: '/problemList', icon: 'list-alt', colors: ['#00d2ff', '#007bff'] },
  { label: 'Contest Time', route: '/contestTime', icon: 'access-time', colors: ['#00d2ff', '#007bff'] },
  { label: 'Progress', route: '/progress', icon: 'trending-up', colors: ['#00d2ff', '#007bff'] },
];

const upcomingFeatures: Feature[] = [
  { label: 'Practice', route: '/practice', icon: 'code', colors: ['#4facfe', '#00f2fe'] },
  { label: 'Social', route: '/social', icon: 'people', colors: ['#a6c1ee', '#fbc2eb'] },
];

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  // All menu items (add more as needed)
  const menuItems: Array<{
    label: string;
    route?: string;
    action?: () => void;
    icon: keyof typeof MaterialIcons.glyphMap;
  }> = [
    { label: 'Profile', route: '/profile', icon: 'person' },
    ...mainFeatures.map(f => ({ label: f.label, route: f.route, icon: f.icon })),
    ...upcomingFeatures.map(f => ({ label: f.label, route: f.route, icon: f.icon })),
    { label: 'Sign Out', action: handleSignOut, icon: 'logout' },
  ];

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header with menu */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 16 }}>
                <MaterialIcons name="menu" size={32} color={COLORS.white} />
              </TouchableOpacity>
              <MaterialIcons 
                name="code" 
                size={38} 
                color={COLORS.primary} 
                style={styles.logoIcon}
              />
              <Text style={styles.title}>
                <Text style={{ color: COLORS.primary }}>CP</Text>
                <Text style={{ color: COLORS.white }}> Companion</Text>
              </Text>
            </View>
          </View>

          {/* Menu Modal */}
          {menuVisible && (
            <View style={styles.menuOverlay}>
              <View style={styles.menuContainer}>
                {menuItems.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      if (item.route) router.push(item.route as any);
                      if (item.action) item.action();
                    }}
                  >
                    <MaterialIcons name={item.icon} size={22} color={COLORS.primary} style={{ marginRight: 12 }} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.menuClose}>
                  <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </View>
              {/* Transparent area to close menu */}
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setMenuVisible(false)} />
            </View>
          )}

          <SignedIn>
            {/* Feature Sections */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Main Features</Text>
              <View style={styles.gridContainer}>
                {mainFeatures.map((item, index) => (
                  <FeatureCard key={index} feature={item} onPress={() => router.push(item.route as any)} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Features</Text>
              <View style={styles.gridContainer}>
                {upcomingFeatures.map((item, index) => (
                  <FeatureCard key={index} feature={item} onPress={() => router.push(item.route as any)} />
                ))}
              </View>
            </View>

            {/* Sign Out button removed from here */}
          </SignedIn>

          <SignedOut>
            <View style={styles.authCard}>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
              
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity>
                    <Text style={styles.footerLink}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </SignedOut>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const FeatureCard = ({ feature, onPress }: { feature: Feature, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.cardWrapper}>
    <LinearGradient 
      colors={feature.colors} 
      start={[0, 0]} 
      end={[1, 1]} 
      style={styles.featureCard}
    >
      <View style={styles.cardContent}>
        <MaterialIcons name={feature.icon} size={35} color="white" />
        <Text style={styles.cardText}>{feature.label}</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  logoIcon: {
    marginRight: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1.2,
  },
  section: {
    width: '100%',
    marginBottom: 32,
    maxWidth: 600,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 20,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  cardWrapper: {
    width: '45%',
    minWidth: 150,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featureCard: {
    padding: 20,
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
    gap: 12,
  },
  cardText: {
    fontWeight: '600',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 32,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
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
  signOutButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.33)',
    borderRadius: 12,
    width: '100%',
    maxWidth: 200,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
  },
  signOutText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    flexDirection: 'row',
    zIndex: 100,
  },
  menuContainer: {
    backgroundColor: COLORS.darkBg,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    padding: 24,
    minWidth: 220,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    height: '100%',
    justifyContent: 'flex-start',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    width: '100%',
  },
  menuItemText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '600',
  },
  menuClose: {
    alignSelf: 'flex-end',
    marginTop: 10,
    padding: 6,
  },
});