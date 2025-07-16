import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { FC } from 'react';
import { ActivityIndicator } from 'react-native';

const HomeLayout: FC = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <ActivityIndicator size="large" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/welcome" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default HomeLayout;