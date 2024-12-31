import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchFeedbacks } from '../utils/api';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';

const { width, height } = Dimensions.get('window');

const DEFAULT_PROFILE_IMAGE = require('../../assets/main/default_profile_photo.png');

class FeedbackItem extends React.PureComponent {
    renderStars(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"} 
                    size={20} 
                    color="#FFEB3B" 
                />
            );
        }
        return stars;
    }

    render() {
        const { item, navigateToConsumerDetails } = this.props;

        return (
            <View style={styles.feedbackCard}>
                <TouchableOpacity onPress={() => navigateToConsumerDetails(item)}>
                    <Image
                        source={item.consumer.profile_pic ? { uri: item.consumer.profile_pic } : DEFAULT_PROFILE_IMAGE}
                        style={styles.feedbackImage}
                        resizeMode="cover"
                        onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                    />
                </TouchableOpacity>

                <View style={styles.feedbackInfo}>
                    <View style={styles.ratingContainer}>
                        {this.renderStars(item.rating)}
                    </View>

                    <View style={styles.descriptionWrapper}>
                        <Text style={styles.feedbackDescription}>{item.description}</Text>
                    </View>

                    <View style={styles.tagWrapper}>
                        <Text style={styles.feedbackTag}>{item.tags}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const ConsumerFeedback = () => {
    const { user } = useAuth();
    const userId = user?.id_user;
    const navigation = useNavigation();

    const { data: feedbackData = [], isLoading: loadingFeedback, refetch: refetchFeedbacks } = useQuery({
        queryKey: ['feedback', userId],
        queryFn: () => fetchFeedbacks(userId), 
        staleTime: 1000 * 60 * 5,
    });

    console.log('check feedbacks:', feedbackData);

    useRealTimeUpdates(userId);

    useFocusEffect(
        React.useCallback(() => {
            refetchFeedbacks();
        }, [])
    );

    if (loadingFeedback) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#34A853" />
            </View>
        );
    }

    const navigateToConsumerDetails = (item) => {
        navigation.navigate('ConsumerDetails', { feedback: item });
    };

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={35} color="#34A853" />
                </TouchableOpacity>

                <Text style={styles.title}>Consumer's Feedback History</Text>
            </View>
        );
    };

    return (
        <FlatList
            data={feedbackData}
            renderItem={({ item }) => <FeedbackItem item={item} navigateToConsumerDetails={navigateToConsumerDetails}/>}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
                <View>
                    <StatusBar hidden={false} />
                    {renderHeader()}

                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        padding: 10,
        marginBottom: height * 0.02,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
    },
    title: {
        fontSize: 14,
        fontFamily: 'medium',
        textAlign: 'center',
    },
    feedbackCard: {
        flexWrap: 'wrap',
        marginTop: 10,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        padding: 10,
        flexDirection: 'row',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ratingContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        position: 'relative',
    },
    checkboxFeedbackContainer: {
        position: 'absolute',
        right: 0, 
        top: 0,
        marginLeft: 10, 
    },
    feedbackImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'white',
        marginRight: 10,
    },
    feedbackInfo: {
        padding: 10,
        justifyContent: 'center',
    },
    descriptionWrapper:{
        marginTop: 5,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedbackDescription: {
        fontSize: 12,
        fontFamily: 'regular',
        color: 'white',
    },
    feedbackStar: {
        fontSize: 16,
        color: '#FFD700',
    },
    tagWrapper: {
        marginTop: 5,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedbackTag: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        fontSize: 12,
        fontFamily: 'regular',
        color: 'black',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkbuttonContainer: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxContainer: {
        alignItems: 'center',
        padding: 5,
    },
    textDisplay: {
        fontSize: 12,
        fontFamily: 'regular',
    },
});

export default ConsumerFeedback;
