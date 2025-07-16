import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { FC } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  primary: '#3A59D1',       // Deep blue
  secondary: '#3D90D7',     // Light blue
  accent1: '#7AC6D2',       // Teal
  accent2: '#B5FCCD',       // Mint green
  darkBg: '#0f172a',
  white: '#ffffff',
  translucentWhite: 'rgba(255, 255, 255, 0.7)',
};

const WelcomeScreen: FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.darkBg, '#1e293b', '#334155']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.wrapper}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={styles.header}>
                <MaterialIcons
                  name="code"
                  size={58}
                  color={COLORS.primary}
                  style={styles.logoIcon}
                />
                <Text style={styles.title}>
                  <Text style={{ color: COLORS.primary }}>CP</Text> Companion
                </Text>
                <Text style={styles.subtitle}>
                  Start your coding journey
                </Text>
              </View>

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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  wrapper: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoIcon: {
    marginBottom: 10,
    textShadowColor: 'rgba(58, 89, 209, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 6,
    marginBottom: 8,
    letterSpacing: 1.1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.translucentWhite,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      },
    }),
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: COLORS.primary,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(58,89,209,0.25)',
      },
    }),
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;
