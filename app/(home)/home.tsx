import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { ComponentProps, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_GAP = 16;
const CARD_WIDTH = (width - 20 * 2 - CARD_GAP) / 2;

const COLORS = {
  background: "#F3E2D4",
  primary: "#C5B0CD",
  secondary: "#415E72",
  textDark: "#17313E",
  white: "#FFFFFF",
  translucentPrimary: "rgba(197,176,205,0.4)",
  translucentSecondary: "rgba(65,94,114,0.1)",
  cardBg: "rgba(255,255,255,0.85)",
  error: "#FF6347",
  menuOverlayBg: "rgba(23,49,62,0.4)",
  featureCard: "#E8D5E0",
  featureCardDark: "#D2BFCF",
  menuBackground: "#F8EDE6",
  menuBorder: "rgba(197,176,205,0.3)",
};

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type Feature = {
  label: string;
  route: string;
  icon: IconName;
  color: string;
};

type RouteItem = {
  type: "route";
  label: string;
  route: string;
  icon: IconName;
};
type ActionItem = {
  type: "action";
  label: string;
  action: () => void;
  icon: IconName;
};
type MenuItem = RouteItem | ActionItem;

const mainFeatures: Feature[] = [
  { label: "Resources", route: "/resources", icon: "menu-book", color: COLORS.featureCard },
  { label: "Problem List", route: "/problemList", icon: "list-alt", color: COLORS.featureCardDark },
  { label: "Contest Schedule", route: "/contestTime", icon: "access-time", color: COLORS.featureCard },
  { label: "Progress", route: "/progress", icon: "trending-up", color: COLORS.featureCardDark },
];

const upcomingFeatures: Feature[] = [
  { label: "Practice", route: "/practice", icon: "code", color: COLORS.featureCard },
  { label: "Social", route: "/social", icon: "people", color: COLORS.featureCardDark },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link href={feature.route as any} asChild>
      <TouchableOpacity style={styles.cardWrapper} accessibilityLabel={feature.label} accessibilityRole="button">
        <View style={[styles.featureCard, { backgroundColor: feature.color }]}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={feature.icon} size={28} color={COLORS.textDark} />
            </View>
            <Text style={styles.cardText}>{feature.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const SideMenu = ({
  visible,
  menuItems,
  onClose,
  onItemPress,
}: {
  visible: boolean;
  menuItems: MenuItem[];
  onClose: () => void;
  onItemPress: (item: MenuItem) => void;
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.menuOverlay}>
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <View style={styles.menuTitleContainer}>
              <MaterialIcons name="menu" size={22} color={COLORS.textDark} />
              <Text style={styles.menuTitle}> Menu</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close menu" accessibilityRole="button">
              <MaterialIcons name="close" size={20} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuItemsContainer} contentContainerStyle={styles.menuItemsContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.menuSectionTitle}>Main Features</Text>
            {menuItems
              .filter((item) => item.type === "route" && mainFeatures.some((f) => f.label === item.label))
              .map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.menuItem} onPress={() => onItemPress(item)} accessibilityLabel={item.label} accessibilityRole="button">
                  <View style={[styles.menuIconContainer, { backgroundColor: COLORS.translucentPrimary }]}>
                    <MaterialIcons name={item.icon} size={20} color={COLORS.textDark} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
              ))}

            <Text style={styles.menuSectionTitle}>Upcoming Features</Text>
            {menuItems
              .filter((item) => item.type === "route" && upcomingFeatures.some((f) => f.label === item.label))
              .map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.menuItem} onPress={() => onItemPress(item)} accessibilityLabel={item.label} accessibilityRole="button">
                  <View style={[styles.menuIconContainer, { backgroundColor: COLORS.translucentPrimary }]}>
                    <MaterialIcons name={item.icon} size={20} color={COLORS.textDark} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
              ))}

            <Text style={styles.menuSectionTitle}>Account</Text>
            {menuItems
              .filter((item) => item.type === "action")
              .map((item, idx) => (
                <TouchableOpacity key={idx} style={[styles.menuItem, styles.signOutItem]} onPress={() => onItemPress(item)} accessibilityLabel={item.label} accessibilityRole="button">
                  <View style={[styles.menuIconContainer, { backgroundColor: "rgba(255,99,71,0.12)" }]}>
                    <MaterialIcons name={item.icon} size={20} color={COLORS.error} />
                  </View>
                  <Text style={[styles.menuItemText, { color: COLORS.error }]}>{item.label}</Text>
                  <MaterialIcons name="chevron-right" size={18} color={COLORS.error} />
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.menuOverlayTouchable} onPress={onClose} activeOpacity={1} />
      </View>
    </Modal>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems: MenuItem[] = [
    ...mainFeatures.map((f) => ({ type: "route" as const, ...f })),
    ...upcomingFeatures.map((f) => ({ type: "route" as const, ...f })),
    { type: "action" as const, label: "Sign Out", action: () => signOut(), icon: "logout" },
  ];

  const handleMenuItemPress = (item: MenuItem) => {
    setMenuVisible(false);
    if (item.type === "route") {
      router.push((item as RouteItem).route as any);
    } else {
      item.action();
    }
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SideMenu visible={menuVisible} menuItems={menuItems} onClose={() => setMenuVisible(false)} onItemPress={handleMenuItemPress} />

      {/* Fixed header (keeps title visible on web like ProblemList) */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton} accessibilityLabel="Open menu" accessibilityRole="button">
            <View style={styles.menuButtonInner}>
              <MaterialIcons name="menu" size={24} color={COLORS.textDark} />
            </View>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <MaterialIcons name="code" size={32} color={COLORS.secondary} style={styles.titleIcon} />
            <Text style={styles.title}>
              <Text style={{ color: COLORS.textDark }}>CP</Text>
              <Text style={{ color: COLORS.secondary }}> Companion</Text>
            </Text>
          </View>

          <View style={styles.menuButtonPlaceholder} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <SignedIn>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Main Features</Text>
            <View style={styles.gridContainer}>
              {mainFeatures.map((item, index) => (
                <View key={index} style={[styles.cardContainer, { width: CARD_WIDTH }]}>
                  <FeatureCard feature={item} />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Features</Text>
            <View style={styles.gridContainer}>
              {upcomingFeatures.map((item, index) => (
                <View key={index} style={[styles.cardContainer, { width: CARD_WIDTH }]}>
                  <FeatureCard feature={item} />
                </View>
              ))}
            </View>
          </View>
        </SignedIn>

        <SignedOut>
          <View style={styles.authCard}>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity style={styles.button} accessibilityLabel="Sign In" accessibilityRole="button">
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </Link>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity accessibilityLabel="Sign Up" accessibilityRole="button">
                  <Text style={styles.footerLink}> Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </SignedOut>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  // base container used on mobile and small screens
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 40 : 60,
    paddingHorizontal: 24,
  },
  // center and constrain width on web (desktop)
  webContainer: {
    alignSelf: "center",
    width: "70%",
    maxWidth: 920,
  },
  headerContainer: {
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 6 : 36,
    paddingBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: COLORS.background,
  },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  menuButton: { padding: 8 },
  menuButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.translucentPrimary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.menuBorder,
  },
  menuButtonPlaceholder: { width: 40 },

  titleContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", flex: 1 },
  titleIcon: { marginRight: 8 },
  title: { fontSize: 26, fontWeight: "800" },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 16,
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingVertical: 6,
  },

  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cardContainer: { marginBottom: CARD_GAP },
  cardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    aspectRatio: 1,
  },
  featureCard: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16, borderRadius: 16 },
  cardContent: { alignItems: "center" },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardText: { fontWeight: "600", fontSize: 15, color: COLORS.textDark, textAlign: "center" },

  authCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: COLORS.translucentPrimary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  button: { backgroundColor: COLORS.secondary, paddingVertical: 14, borderRadius: 12, width: "100%", alignItems: "center", marginBottom: 16, elevation: 4 },
  buttonText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", width: "100%" },
  footerText: { color: COLORS.secondary, fontSize: 14 },
  footerLink: { color: COLORS.textDark, fontSize: 14, fontWeight: "600" },

  // menu
  menuOverlay: { flex: 1, flexDirection: "row", backgroundColor: COLORS.menuOverlayBg },
  menuContainer: {
    backgroundColor: COLORS.menuBackground,
    height: "100%",
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    borderRightWidth: 1,
    borderRightColor: COLORS.menuBorder,
    width: Platform.OS === "web" ? 320 : "85%",
    maxWidth: 320,
  },
  menuHeader: {
    padding: 18,
    paddingTop: (Platform.OS === "android" ? StatusBar.currentHeight || 24 : 50) + 10,
    paddingBottom: 14,
    backgroundColor: COLORS.menuBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.menuBorder,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuTitleContainer: { flexDirection: "row", alignItems: "center" },
  menuTitle: { color: COLORS.textDark, fontSize: 20, fontWeight: "800", marginLeft: 8 },
  closeButton: { padding: 8, borderRadius: 20, backgroundColor: COLORS.translucentSecondary },

  menuItemsContainer: { flex: 1, backgroundColor: COLORS.menuBackground },
  menuItemsContent: { paddingVertical: 12, paddingBottom: 40 },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.secondary,
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 18,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: COLORS.menuBorder, backgroundColor: COLORS.menuBackground },
  signOutItem: { marginTop: 20, borderTopWidth: 1, borderTopColor: COLORS.menuBorder, borderBottomWidth: 0 },
  menuIconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuItemText: { color: COLORS.textDark, fontSize: 16, fontWeight: "500", flex: 1 },
  menuOverlayTouchable: { flex: 1 },
});