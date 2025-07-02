// app/(auth)/welcome.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import 'expo-router/entry';
import { FC } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const COLORS = {
  primary: '#00d2ff',
  secondary: '#3a7bd5',
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
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.content}>
              <View style={styles.header}>
                <MaterialIcons 
                  name="code" 
                  size={54} 
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
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>
                </Link>
                <Link href="/sign-up" asChild>
                  <TouchableOpacity style={styles.secondaryButton}>
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
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
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
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  subtitle: {
    color: COLORS.translucentWhite,
    fontSize: 17,
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '400',
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 10,
    marginBottom: 10,
    // Web shadow
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px 0 rgba(0,0,0,0.13)' } : {}),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 8px 0 rgba(0,210,255,0.10)' } : {}),
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;