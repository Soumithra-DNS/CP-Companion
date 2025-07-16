import { useState } from 'react';
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
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#3A59D1',
  secondary: '#3D90D7',
  accent1: '#7AC6D2',
  accent2: '#B5FCCD',
  darkBg: '#0f172a',
  white: '#ffffff',
  inputBg: 'rgba(255, 255, 255, 0.12)',
  inputBorder: 'rgba(255, 255, 255, 0.3)',
};

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password: string) => password.length >= 6;

  const handleSignUp = async () => {
    if (!isLoaded) return;

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || err?.message || 'An error occurred.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: completeSignUp.createdSessionId });
      router.replace('/(home)/home');
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || err?.message || 'Verification failed.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const AuthHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <View style={styles.header}>
      <MaterialIcons name="code" size={54} color={COLORS.primary} style={styles.logoIcon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  const AuthButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.button, loading && styles.disabledButton]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );

  const PasswordField = ({
    label,
    value,
    onChange,
    visible,
    toggleVisible,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    visible: boolean;
    toggleVisible: () => void;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder={label}
          placeholderTextColor="#cbd5e1"
          secureTextEntry={!visible}
          value={value}
          onChangeText={onChange}
          selectionColor={COLORS.primary}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={toggleVisible}>
          <MaterialIcons name={visible ? 'visibility-off' : 'visibility'} size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const InputField = ({
    label,
    value,
    onChange,
    ...props
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    [x: string]: any;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={label}
        placeholderTextColor="#cbd5e1"
        value={value}
        onChangeText={onChange}
        selectionColor={COLORS.primary}
        {...props}
      />
    </View>
  );

  const VerificationScreen = () => (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <AuthHeader title="Verify Email" subtitle="Enter the code sent to your email" />
            <View style={styles.card}>
              <InputField label="Verification Code" value={code} onChange={setCode} />
              <AuthButton title="Verify" onPress={handleVerification} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );

  if (pendingVerification) return <VerificationScreen />;

  return (
    <LinearGradient colors={[COLORS.darkBg, '#1e293b', '#334155']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <AuthHeader
              title="Create Account"
              subtitle="Start your competitive programming journey"
            />
            <View style={styles.card}>
              <InputField
                label="Email Address"
                value={email}
                onChange={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <PasswordField
                label="Password"
                value={password}
                onChange={setPassword}
                visible={isPasswordVisible}
                toggleVisible={() => setIsPasswordVisible(!isPasswordVisible)}
              />
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={isConfirmPasswordVisible}
                toggleVisible={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              />

              <AuthButton title="Sign Up" onPress={handleSignUp} />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity disabled={loading}>
                    <Text style={[styles.footerLink, loading && styles.disabledLink]}>Login</Text>
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
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  content: { alignItems: 'center', width: '100%' },
  header: { alignItems: 'center', marginBottom: 28 },
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
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  subtitle: {
    color: COLORS.accent2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  inputGroup: { width: '100%', marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.white, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
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
    borderWidth: 1,
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
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: { opacity: 0.7 },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  footerText: { color: COLORS.white, fontSize: 14 },
  footerLink: { color: COLORS.accent1, fontWeight: '600', fontSize: 14 },
  disabledLink: { opacity: 0.5 },
});
