import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { FC } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  background: '#F3E2D4',
  primary: '#C5B0CD',
  secondary: '#415E72',
  textDark: '#17313E',
  white: '#FFFFFF',
  translucentPrimary: 'rgba(197,176,205,0.4)',
  cardBg: 'rgba(255,255,255,0.85)',
  menuBorder: 'rgba(197,176,205,0.3)',
};

const WelcomeScreen: FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="code" size={48} color={COLORS.secondary} />
              </View>
              <Text style={styles.title}>
                <Text style={{ color: COLORS.textDark }}>CP</Text>
                <Text style={{ color: COLORS.secondary }}> Companion</Text>
              </Text>
              <Text style={styles.subtitle}>
                Start your coding journey
              </Text>
            </View>

            {/* Card with Buttons */}
            <View style={styles.card}>
              <Link href="/sign-in" asChild>
                <TouchableOpacity activeOpacity={0.85} style={styles.button}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              </Link>
              <Link href="/sign-up" asChild>
                <TouchableOpacity activeOpacity={0.85} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Feature Highlights */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialIcons name="lightbulb-outline" size={24} color={COLORS.secondary} />
                </View>
                <Text style={styles.featureText}>Practice Problems</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialIcons name="trending-up" size={24} color={COLORS.secondary} />
                </View>
                <Text style={styles.featureText}>Track Progress</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MaterialIcons name="emoji-events" size={24} color={COLORS.secondary} />
                </View>
                <Text style={styles.featureText}>Compete & Win</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.background,
  },
  wrapper: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.translucentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.menuBorder,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.translucentPrimary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.translucentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.menuBorder,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
});

export default WelcomeScreen;