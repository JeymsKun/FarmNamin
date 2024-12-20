import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const FeedbackCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.feedbackBox}>
        <Text style={styles.title}>You gave feedback to Mang Kanor</Text>
        <View style={styles.profileSection}>
          <Image
            source={require('../assets/images/mangkanor.jpg')} 
            style={styles.profileImage}
          />
          <View style={styles.ratingSection}>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.feedbackText}>Sulit sa budget salamat po</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Low Price</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  feedbackBox: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    marginTop: -450, 
  },
  title: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  ratingSection: {
    flex: 1,
  },
  stars: {
    fontSize: 20,
    color: '#FFD700', // Gold color for stars
    marginBottom: 5,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FeedbackCard;
