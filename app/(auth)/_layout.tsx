// app/(auth)/_layout.tsx

import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Platform } from 'react-native';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(home)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}