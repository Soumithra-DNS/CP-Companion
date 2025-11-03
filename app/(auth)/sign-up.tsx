import { useSignUp } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
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
  TextInputProps,
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
  placeholder: '#7A8A99',
};

// --- Prop Types ---
type AuthHeaderProps = { title: string; subtitle: string };
type AuthButtonProps = { title: string; onPress: () => void; loading?: boolean };
type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (text: string) => void;
  visible: boolean;
  toggleVisible: () => void;
  loading?: boolean;
};
interface InputFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  loading?: boolean;
}
type VerificationScreenProps = {
  code: string;
  setCode: (code: string) => void;
  handleVerification: () => void;
  loading?: boolean;
  onBack: () => void;
};

// --- Helper Components ---

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => (
  <View style={styles.logoSection}>
    <View style={styles.iconCircle}>
      <MaterialIcons name="code" size={48} color={COLORS.secondary} />
    </View>
    <Text style={styles.title}>
      <Text style={{ color: COLORS.textDark }}>CP</Text>
      <Text style={{ color: COLORS.secondary }}> Companion</Text>
    </Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const AuthButton = ({ title, onPress, loading }: AuthButtonProps) => (
  <TouchableOpacity
    style={[styles.button, loading && styles.disabledButton]}
    onPress={onPress}
    disabled={loading}
  >
    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>{title}</Text>}
  </TouchableOpacity>
);

const PasswordField = ({ label, value, onChange, visible, toggleVisible, loading }: PasswordFieldProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.passwordWrapper}>
      <TextInput
        style={styles.passwordInput}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={COLORS.placeholder}
        secureTextEntry={!visible}
        value={value}
        onChangeText={onChange}
        selectionColor={COLORS.secondary}
        editable={!loading}
      />
      <TouchableOpacity style={styles.eyeButton} onPress={toggleVisible} disabled={loading}>
        <MaterialIcons 
          name={visible ? 'visibility-off' : 'visibility'} 
          size={22} 
          color={loading ? COLORS.placeholder : COLORS.secondary} 
        />
      </TouchableOpacity>
    </View>
  </View>
);

const InputField = ({ label, value, onChangeText, loading, ...props }: InputFieldProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={`Enter ${label.toLowerCase()}`}
      placeholderTextColor={COLORS.placeholder}
      value={value}
      onChangeText={onChangeText}
      selectionColor={COLORS.secondary}
      editable={!loading}
      {...props}
    />
  </View>
);

const VerificationScreen = ({ code, setCode, handleVerification, loading, onBack }: VerificationScreenProps) => (
  <View style={styles.page}>
    <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <View style={styles.backButtonInner}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textDark} />
            </View>
          </TouchableOpacity>
        </View>

        <AuthHeader title="Verify Email" subtitle="Enter the code sent to your email" />
        
        <View style={styles.card}>
          <InputField 
            label="Verification Code" 
            value={code} 
            onChangeText={setCode}
            keyboardType="number-pad"
            loading={loading}
          />
          <AuthButton title="Verify" onPress={handleVerification} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>
);

// --- Main SignUp Screen ---

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

  if (pendingVerification) {
    return (
      <VerificationScreen
        code={code}
        setCode={setCode}
        handleVerification={handleVerification}
        loading={loading}
        onBack={() => setPendingVerification(false)}
      />
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
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

          <AuthHeader
            title="Create Account"
            subtitle="Start your competitive programming journey"
          />
          
          <View style={styles.card}>
            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              loading={loading}
            />
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              visible={isPasswordVisible}
              toggleVisible={() => setIsPasswordVisible(!isPasswordVisible)}
              loading={loading}
            />
            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={isConfirmPasswordVisible}
              toggleVisible={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              loading={loading}
            />

            <AuthButton title="Sign Up" onPress={handleSignUp} loading={loading} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity disabled={loading}>
                  <Text style={[styles.footerLink, loading && styles.disabledLink]}>Login</Text>
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
  eyeButton: { padding: 14 },
  button: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  disabledButton: { opacity: 0.7 },
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
  disabledLink: { opacity: 0.5 },
});