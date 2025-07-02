// app/(auth)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (Platform.OS === 'web') {
    if (isSignedIn) {
      return <Redirect href="/(home)/home" />; 
    }
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  // Mobile handling
  if (isSignedIn) {
    const url = Linking.createURL('/(home)/home');
    Linking.openURL(url);
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}