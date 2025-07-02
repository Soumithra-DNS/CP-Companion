import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { tokenCache } from '../utils/cache';

const InitialLayout = () => {
  const { isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <Slot />;
};

const RootLayout = () => {
  if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Configuration error - Please contact support</Text>
      </View>
    );
  }
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <InitialLayout />
    </ClerkProvider>
  );
};

export default RootLayout;