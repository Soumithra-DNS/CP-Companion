import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

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
  placeholder: '#7A8A99',
};

export default function ForgotPasswordScreen() {
  const { signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Step 1: Request password reset code
  const handleSendResetCode = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: trimmedEmail,
      });
      setEmailSent(true);
      Alert.alert('Check your Email', 'A password reset code has been sent to your inbox.');
    } catch (error: any) {
      const message = error?.errors?.[0]?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and set new password
  const handleResetPassword = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the reset code.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result?.status === 'complete') {
        await setActive?.({ session: result.createdSessionId });
        Alert.alert('Success', 'Your password has been reset successfully.', [
          { text: 'OK', onPress: () => router.replace('/(home)/home') },
        ]);
      } else {
        Alert.alert('Error', 'Could not reset password. Please try again.');
      }
    } catch (error: any) {
      const message = error?.errors?.[0]?.message || 'Invalid code or something went wrong.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
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
              <MaterialIcons name="lock-reset" size={48} color={COLORS.secondary} />
            </View>
            <Text style={styles.title}>
              <Text style={{ color: COLORS.textDark }}>Reset</Text>
              <Text style={{ color: COLORS.secondary }}> Password</Text>
            </Text>
            <Text style={styles.subtitle}>
              {emailSent
                ? `Enter the code sent to ${email} and set a new password.`
                : 'Enter your email to receive a password reset code.'}
            </Text>
          </View>

          {/* Conditional Rendering: Show email form OR reset form */}
          {emailSent ? (
            // STEP 2: FORM TO ENTER CODE AND NEW PASSWORD
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reset Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter the 6-digit code"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                  selectionColor={COLORS.secondary}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter new password"
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    selectionColor={COLORS.secondary}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <MaterialIcons 
                      name={showPassword ? 'visibility-off' : 'visibility'} 
                      size={22} 
                      color={loading ? COLORS.placeholder : COLORS.secondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your new password"
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    selectionColor={COLORS.secondary}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <MaterialIcons 
                      name={showConfirmPassword ? 'visibility-off' : 'visibility'} 
                      size={22} 
                      color={loading ? COLORS.placeholder : COLORS.secondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // STEP 1: FORM TO ENTER EMAIL
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  selectionColor={COLORS.secondary}
                  editable={!loading}
                />
              </View>
              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleSendResetCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={[styles.link, loading && styles.disabledLink]}>
                  <MaterialIcons name="arrow-back" size={16} color={COLORS.secondary} /> Back to Sign In
                </Text>
              </TouchableOpacity>
            </Link>
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
    fontSize: 15,
    color: COLORS.secondary,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 22,
    paddingHorizontal: 10,
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
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
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
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  link: {
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  disabledLink: {
    opacity: 0.5,
  },
});