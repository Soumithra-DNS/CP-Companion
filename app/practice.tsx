import { StyleSheet, Text, View } from 'react-native';

export default function PracticeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Practice Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181818' },
  text: { color: '#00d2ff', fontSize: 22, fontWeight: '700' },
});
