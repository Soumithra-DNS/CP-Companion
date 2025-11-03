import { useSignIn } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  inputBg: 'rgba(255,255,255,0.6)',
  inputBorder: 'rgba(197,176,205,0.5)',
  error: '#FF6347',
  placeholder: '#7A8A99',
};

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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
    setPasswordError('');

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
      const message = err?.errors?.[0]?.message || '';
      if (message.toLowerCase().includes('password') || message.toLowerCase().includes('credential') || message.toLowerCase().includes('identifier')) {
        setPasswordError('Wrong Password');
      } else {
        Alert.alert('Login Failed', message || 'Login failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifierChange = (text: string) => {
    setIdentifier(text);
    if (passwordError) setPasswordError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <View style={styles.backButtonInner}>
                <MaterialIcons name="arrow-back" size={24} color={COLORS.textDark} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="code" size={48} color={COLORS.secondary} />
            </View>
            <Text style={styles.title}>
              <Text style={{ color: COLORS.textDark }}>CP</Text>
              <Text style={{ color: COLORS.secondary }}> Companion</Text>
            </Text>
            <Text style={styles.subtitle}>Welcome back! Sign in to continue</Text>
          </View>

          {/* Sign In Card */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email or username"
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                value={identifier}
                onChangeText={handleIdentifierChange}
                selectionColor={COLORS.secondary}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.placeholder}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={handlePasswordChange}
                  selectionColor={COLORS.secondary}
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
                    color={loading ? COLORS.placeholder : COLORS.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

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
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text style={[styles.footerLink, loading && styles.disabledLink]}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 36,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.translucentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.menuBorder,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.translucentPrimary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: { 
    width: '100%', 
    marginBottom: 18,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.textDark, 
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.textDark,
    width: '100%',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1.5,
    borderRadius: 12,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: COLORS.textDark,
  },
  eyeButton: { 
    padding: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
    marginTop: -8,
    marginBottom: 10,
  },
  link: {
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'right',
    width: '100%',
    marginBottom: 20,
  },
  disabledLink: { 
    opacity: 0.5,
  },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: { 
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
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