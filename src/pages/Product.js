import { View, Text, StyleSheet } from 'react-native';

const Home = () => {

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Product Screen</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
  },
});

export default Home;
