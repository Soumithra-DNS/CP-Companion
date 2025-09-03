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
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isPortrait = height > width;
const CARD_GAP = 16;
const CARD_WIDTH = (width - 48) / 2; // 32 total padding + 16 gap

const COLORS = {
  primary: '#3A59D1',
  secondary: '#3D90D7',
  accent1: '#7AC6D2',
  accent2: '#B5FCCD',
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

type MenuItem = {
  label: string;
  route?: string;
  action?: () => void;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const mainFeatures: Feature[] = [
  { label: 'Resources', route: '/resources', icon: 'menu-book', colors: ['#3A59D1', '#3D90D7'] },
  { label: 'Problem List', route: '/problemList', icon: 'list-alt', colors: ['#3D90D7', '#7AC6D2'] },
  { label: 'Contest Schedule', route: '/contestTime', icon: 'access-time', colors: ['#7AC6D2', '#B5FCCD'] },
  { label: 'Progress', route: '/progress', icon: 'trending-up', colors: ['#3A59D1', '#B5FCCD'] },
];

const upcomingFeatures: Feature[] = [
  { label: 'Practice', route: '/practice', icon: 'code', colors: ['#3A59D1', '#7AC6D2'] },
  { label: 'Social', route: '/social', icon: 'people', colors: ['#3D90D7', '#B5FCCD'] },
];

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  const menuItems: MenuItem[] = [
    ...mainFeatures.map(f => ({ label: f.label, route: f.route, icon: f.icon })),
    ...upcomingFeatures.map(f => ({ label: f.label, route: f.route, icon: f.icon })),
    { label: 'Sign Out', action: handleSignOut, icon: 'logout' },
  ];

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity 
                onPress={() => setMenuVisible(true)} 
                style={styles.menuButton}
              >
                <MaterialIcons name="menu" size={32} color={COLORS.white} />
              </TouchableOpacity>
              <MaterialIcons name="code" size={38} color={COLORS.primary} style={styles.logoIcon} />
              <Text style={styles.title}>
                <Text style={{ color: COLORS.primary }}>CP</Text>
                <Text style={{ color: COLORS.white }}> Companion</Text>
              </Text>
            </View>
          </View>

          {/* Mobile Menu */}
          {menuVisible && (
            <View style={styles.menuOverlay}>
              <View style={[
                styles.menuContainer,
                isPortrait ? styles.menuContainerPortrait : styles.menuContainerLandscape
              ]}>
                <LinearGradient 
                  colors={[COLORS.primary, COLORS.secondary]} 
                  style={styles.menuHeader}
                >
                  <View style={styles.menuHeaderContent}>
                    <MaterialIcons name="menu" size={28} color={COLORS.white} style={{ marginRight: 10 }} />
                    <Text style={styles.menuTitle}>Menu</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setMenuVisible(false)} 
                    style={styles.closeButton}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <MaterialIcons name="close" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </LinearGradient>

                <ScrollView 
                  style={styles.menuItemsContainer}
                  contentContainerStyle={styles.menuItemsContent}
                >
                  {menuItems.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.menuItem,
                        idx === menuItems.length - 1 && styles.signOutItem
                      ]}
                      onPress={() => {
                        setMenuVisible(false);
                        if (item.route) router.push(item.route as any);
                        if (item.action) item.action();
                      }}
                    >
                      <View style={[
                        styles.menuIconContainer,
                        {
                          backgroundColor: idx === menuItems.length - 1 
                            ? 'rgba(255, 99, 71, 0.2)' 
                            : 'rgba(255, 255, 255, 0.2)',
                        },
                      ]}>
                        <MaterialIcons
                          name={item.icon}
                          size={22}
                          color={idx === menuItems.length - 1 ? '#FF6347' : COLORS.white}
                        />
                      </View>
                      <Text style={styles.menuItemText}>{item.label}</Text>
                      <MaterialIcons 
                        name="chevron-right" 
                        size={20} 
                        color={idx === menuItems.length - 1 ? '#FF6347' : COLORS.translucentWhite} 
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <TouchableOpacity 
                style={styles.menuOverlayTouchable} 
                onPress={() => setMenuVisible(false)}
                activeOpacity={1}
              />
            </View>
          )}

          <SignedIn>
            {/* Main Features Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Main Features</Text>
              <View style={styles.gridContainer}>
                {mainFeatures.map((item, index) => (
                  <View key={index} style={[styles.cardContainer, { width: CARD_WIDTH }]}>
                    <FeatureCard 
                      feature={item} 
                      onPress={() => router.push(item.route as any)}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Upcoming Features Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Features</Text>
              <View style={styles.gridContainer}>
                {upcomingFeatures.map((item, index) => (
                  <View key={index} style={[styles.cardContainer, { width: CARD_WIDTH }]}>
                    <FeatureCard 
                      feature={item} 
                      onPress={() => router.push(item.route as any)}
                    />
                  </View>
                ))}
              </View>
            </View>
          </SignedIn>

          <SignedOut>
            <View style={styles.authCard}>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
              </Link>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don&apos;t have an account?</Text>
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

const FeatureCard = ({ feature, onPress }: { feature: Feature; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.cardWrapper}>
    <LinearGradient 
      colors={feature.colors} 
      start={[0, 0]} 
      end={[1, 1]} 
      style={styles.featureCard}
    >
      <View style={styles.cardContent}>
        <MaterialIcons name={feature.icon} size={32} color="white" />
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
    paddingHorizontal: 15,
    paddingTop: 30,
    paddingBottom: 20,
  },
  content: { 
    width: '100%',
  },
  header: { 
    marginBottom: 25,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 20,
  },
  logoIcon: { 
    marginRight: 6,
  },
  title: { 
    fontSize: 30, 
    fontWeight: '800', 
    color: COLORS.white, 
    letterSpacing: 0.5,
  },
  section: { 
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
    paddingLeft: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent2,
  },
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  cardContainer: {
    marginBottom: CARD_GAP,
  },
  cardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    aspectRatio: 1,
  },
  featureCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
    color: COLORS.accent2, 
    fontWeight: '600', 
    fontSize: 14,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 100,
  },
  menuOverlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: COLORS.darkBg,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  menuContainerPortrait: {
    width: '85%',
    maxWidth: 320,
  },
  menuContainerLandscape: {
    width: '60%',
    maxWidth: 400,
  },
  menuHeader: {
    padding: 14,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  menuItemsContainer: {
    flex: 1,
  },
  menuItemsContent: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  signOutItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 20,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});