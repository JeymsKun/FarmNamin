import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, parseISO } from 'date-fns';

const { width } = Dimensions.get('window');

const PostDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { post } = route.params;

  let formattedDate;
  try {
    formattedDate = format(parseISO(post.created_at), 'MMMM d, yyyy, hh:mm a');
  } catch (error) {
    formattedDate = 'Invalid Date'; 
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const descriptionFontSize = post.description.length > 18 ? 12 : 18;
  const locationFontSize = post.location.length > 16 ? 12 : 14;

  const leftArrowColor = currentImageIndex === 0 ? 'gray' : 'green';
  const rightArrowColor = currentImageIndex === post.images.length - 1 ? 'gray' : 'green';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={30} color="green" />
      </TouchableOpacity>
      
      <Text style={[styles.title, { fontSize: descriptionFontSize }]}>
        {post.description}
      </Text>
      <View style={styles.line}/>
      <Text style={[styles.info, { fontSize: locationFontSize }]}>
        Posted by: {post.first_name || 'Farmer'} • {post.location || 'Unknown'}
      </Text>
      <Text style={styles.date}>
        {formattedDate} • #{`0${post.phone_number}`}
      </Text>

      {post.images && post.images.length > 0 && (
        <View style={styles.imageContainer}>
          {post.images.length > 1 && (
            <TouchableOpacity style={[styles.arrowLeft, { borderColor: leftArrowColor }]} onPress={previousImage}>
              <Icon name="chevron-left" size={40} color={leftArrowColor} />
            </TouchableOpacity>
          )}
          <Image
            source={{ uri: post.images[currentImageIndex] }} 
            style={styles.image}
            resizeMode="contain" 
          />
          {post.images.length > 1 && (
            <TouchableOpacity style={[styles.arrowRight, { borderColor: rightArrowColor }]} onPress={nextImage}>
              <Icon name="chevron-right" size={40} color={rightArrowColor} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'medium',
  },
  line: {
    height: 2,
    width: '100%',
    backgroundColor: '#ddd',
    marginBottom: 5,
  },
  endLine: {
    height: 3,
    width: '100%',
    backgroundColor: '#ddd',
    marginTop: 20,
  },
  info: {
    fontSize: 14,
    fontFamily: 'regular',
  },
  date: {
    fontSize: 12,
    fontFamily: 'regular',
    color: '#888',
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 450,
  },
  image: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#ddd',
  },
  arrowLeft: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 30,
    left: 0,
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 1,
  },
  arrowRight: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 30,
    right: 0,
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 1,
  },
});

export default PostDetailScreen;