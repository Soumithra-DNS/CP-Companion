// app/(auth)/forgot-password.tsx
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
  primary: '#00d2ff',
  secondary: '#3a7bd5',
  darkBg: '#0f172a',
  white: '#ffffff',
  translucentWhite: 'rgba(255, 255, 255, 0.7)',
  inputBg: 'rgba(255, 255, 255, 0.08)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
};

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        'Check your inbox for the reset link. If you don\'t see it, please check your spam folder.',
        [
          { text: 'OK', onPress: () => router.replace('/sign-in') }
        ]
      );
    } catch (error: any) {
      const message = error.errors?.[0]?.message || 
                    error.message || 
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
                  ? "We've sent you an email with reset instructions"
                  : "Enter your email to receive a password reset link"}
              </Text>
            </View>

            {!emailSent && (
              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#94a3b8"
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
                    <Text style={styles.buttonText}>Send Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity style={styles.linkContainer} disabled={loading}>
                <Text style={[styles.link, loading && styles.disabledLink]}>
                  <MaterialIcons name="arrow-back" size={16} color={COLORS.primary} /> Back to Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
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
    marginBottom: 10,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  subtitle: {
    color: COLORS.translucentWhite,
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '400',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18,
    padding: 32,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 10,
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px 0 rgba(0,0,0,0.13)' } : {}),
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: COLORS.white,
    width: '100%',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 8px 0 rgba(0,210,255,0.10)' } : {}),
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  linkContainer: {
    marginTop: 24,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  disabledLink: {
    opacity: 0.5,
  },
});