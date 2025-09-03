import { useSignIn } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const COLORS = {
  primary: '#3A59D1',
  secondary: '#3D90D7',
  accent1: '#7AC6D2',
  accent2: '#B5FCCD',
  darkBg: '#0f172a',
  white: '#ffffff',
  translucentWhite: 'rgba(255, 255, 255, 0.7)',
  inputBg: 'rgba(255, 255, 255, 0.06)',
  inputBorder: 'rgba(255, 255, 255, 0.2)',
};

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateInputs = () => {
    if (!identifier.trim()) {
      Alert.alert('Missing Field', 'Please enter your email or username');
      return false;
    }

    if (!password) {
      Alert.alert('Missing Field', 'Please enter your password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!isLoaded || !validateInputs()) return;

    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: identifier.trim(),
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });

      if (Platform.OS === 'web') {
        router.replace('/(home)/home');
        if (WebBrowser.maybeCompleteAuthSession) {
          WebBrowser.maybeCompleteAuthSession();
        }
      } else {
        router.replace('/(home)/home');
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || err?.message || 'Login failed. Try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <MaterialIcons name="code" size={54} color={COLORS.primary} style={styles.logoIcon} />
              <Text style={styles.title}>
                <Text style={{ color: COLORS.primary }}>CP</Text> Companion
              </Text>
              <Text style={styles.subtitle}>Sign in to continue your journey</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email or Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email or username"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={identifier}
                  onChangeText={setIdentifier}
                  selectionColor={COLORS.primary}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    onChangeText={setPassword}
                    selectionColor={COLORS.primary}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                      size={22}
                      color={loading ? '#64748b' : '#94a3b8'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} disabled={loading}>
                <Text style={[styles.link, loading && styles.disabledLink]}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don’t have an account? </Text>
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity disabled={loading}>
                    <Text style={[styles.footerLink, loading && styles.disabledLink]}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: { alignItems: 'center', width: '100%' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    marginBottom: 10,
    ...Platform.select({
      web: {
        textShadow: `0px 2px 8px ${COLORS.primary}`,
      },
      default: {
        textShadowColor: COLORS.primary,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
      },
    }),
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  subtitle: {
    color: COLORS.translucentWhite,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 28,
    marginTop: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 18px rgba(0,0,0,0.12)',
      },
    }),
  },
  inputGroup: { width: '100%', marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.white, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1.2,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: COLORS.white,
    width: '100%',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1.2,
    borderRadius: 10,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: COLORS.white,
  },
  eyeButton: { padding: 14 },
  link: {
    color: COLORS.accent1,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'right',
    width: '100%',
    marginBottom: 20,
  },
  disabledLink: { opacity: 0.5 },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0px 2px 6px rgba(58, 89, 209, 0.18)`,
      },
    }),
  },
  disabledButton: { opacity: 0.7 },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: COLORS.translucentWhite, fontSize: 14 },
  footerLink: { color: COLORS.accent1, fontWeight: '600', fontSize: 14 },
});
