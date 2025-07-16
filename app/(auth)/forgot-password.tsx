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
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

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
  placeholder: '#94a3b8',
};

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: trimmedEmail,
      });

      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Check your inbox for the reset code.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
    } catch (error: any) {
      const message =
        error?.errors?.[0]?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      Alert.alert('Error', message);
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
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <MaterialIcons
                name="lock-reset"
                size={54}
                color={COLORS.primary}
                style={styles.logoIcon}
              />
              <Text style={styles.title}>
                <Text style={{ color: COLORS.primary }}>Reset</Text> Password
              </Text>
              <Text style={styles.subtitle}>
                {emailSent
                  ? "We've sent reset instructions to your email"
                  : 'Enter your email to receive a password reset code'}
              </Text>
            </View>

            {!emailSent && (
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
                    selectionColor={COLORS.primary}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.disabledButton]}
                  onPress={handleForgotPassword}
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
                <TouchableOpacity style={styles.linkContainer} disabled={loading}>
                  <Text style={[styles.link, loading && styles.disabledLink]}>
                    <MaterialIcons name="arrow-back" size={16} color={COLORS.accent1} /> Back to Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
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
  content: {
    alignItems: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    marginBottom: 12,
    textShadowColor: 'rgba(58, 89, 209, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 1.1,
  },
  subtitle: {
    color: COLORS.translucentWhite,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: 300,
    lineHeight: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 28,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: 6,
  },
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
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  linkContainer: {
    width: '100%',
    alignItems: 'center',
  },
  link: {
    color: COLORS.accent1,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  disabledLink: {
    opacity: 0.5,
  },
});