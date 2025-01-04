import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useVideoPlayer, VideoView } from 'expo-video'; 
import Carousel from 'react-native-reanimated-carousel';
import { useAuth } from '../hooks/useAuth';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';

const { width } = Dimensions.get('window');

const FarmerProductViewer = ({ route, navigation }) => {
    const { product, farmer } = route.params;
    const { user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0); 

    useRealTimeUpdates(user?.id_user);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    const mediaItems = product.images.map(image => ({ type: 'image', uri: image }));
    if (product.videos && product.videos.length > 0) {
        product.videos.forEach(video => {
            mediaItems.push({ type: 'video', uri: video });
        });
    }

    const additionalDetails = [
        { label: 'Freshness Duration', value: product.freshness_duration },
        { label: 'Maximum Duration', value: product.maximum_duration },
        { label: 'Date & Time Harvest', value: product.date_time_harvest },
        { label: 'Harvest Method', value: product.harvest_method },
        { label: 'Soil Type', value: product.soil_type },
        { label: 'Water Source', value: product.water_source },
        { label: 'Irrigation Method', value: product.irrigation_method },
        { label: 'Crop Rotation Practice', value: product.crop_rotation_practice },
        { label: 'Use of Fertilizers', value: product.use_of_fertilizers },
        { label: 'Pest Control Measures', value: product.pest_control_measures },
        { label: 'Presence of GMOs', value: product.presence_of_gmos },
        { label: 'Organic Certification', value: product.organic_certification },
        { label: 'Storage Conditions', value: product.storage_conditions },
        { label: 'Ideal Storage Temperature', value: product.ideal_storage_temperature },
        { label: 'Packaging Type', value: product.packaging_type },
        { label: 'Community Support Projects', value: product.community_support_projects },
        { label: 'Cooking Recommendations', value: product.cooking_recommendations },
        { label: 'Best Consumption Period', value: product.best_consumption_period },
        { label: 'Special Handling Instructions', value: product.special_handling_instructions },
        { label: 'Farm History', value: product.farm_history },
        { label: 'Use of Indigenous Knowledge', value: product.use_of_indigenous_knowledge },
        { label: 'Use of Technology in Farming', value: product.use_of_technology_in_farming },
    ];

    const hasAdditionalDetails = additionalDetails.some(detail => detail.value);

    const DEFAULT_PROFILE_IMAGE = require('../../assets/main/default_profile_photo.png');

    const formatPhoneNumberForDisplay = (phoneNumber) => {
        if (phoneNumber && phoneNumber.length === 10 && phoneNumber[0] !== '0') {
            return '0' + phoneNumber;
        }
        return phoneNumber;
    };

    return (
        <View style={styles.container}>

            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                showsVerticalScrollIndicator={false} 
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={30} color="green" />
                    </TouchableOpacity>
                </View>

                {mediaItems.length > 0 ? (
                    mediaItems.length === 1 ? ( 
                        mediaItems[0].type === 'video' ? (
                            <VideoPlayer uri={mediaItems[0].uri} />
                        ) : (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: mediaItems[0].uri }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity 
                                    style={styles.originalSizeButton} 
                                    onPress={() => navigation.navigate('ImageViewer', { uri: mediaItems[0].uri })}
                                >
                                    <Ionicons name="eye" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        )
                ) : (
                     <View style={{ position: 'relative' }}>
                            <Carousel
                                loop
                                width={width} 
                                height={350} 
                                data={mediaItems}
                                onSnapToItem={(index) => setCurrentIndex(index)} 
                                renderItem={({ item, index }) => (
                                    <View key={index} style={styles.carouselItem}>
                                        {item.type === 'video' ? (
                                            <VideoPlayer uri={item.uri} />
                                        ) : (
                                            <View style={styles.imageContainer}>
                                                <Image
                                                    source={{ uri: item.uri }}
                                                    style={styles.productImage}
                                                    resizeMode="cover"
                                                />
                                                <TouchableOpacity 
                                                    style={styles.originalSizeButton} 
                                                    onPress={() => navigation.navigate('ImageViewer', { uri: item.uri })}
                                                >
                                                    <Ionicons name="eye" size={24} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}
                            />
                            {mediaItems.length > 1 && ( 
                                <View style={styles.dotContainer}>
                                    {mediaItems.map((_, index) => (
                                        <View 
                                            key={index} 
                                            style={[
                                                styles.dot, 
                                                currentIndex === index ? styles.activeDot : null
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    )
                ) : (
                    <View style={styles.noMediaContainer}>
                        <Text>No media available</Text>
                    </View>
                )}

                <View style={styles.mainContainer}>
                    <View style={styles.infoContainer}>

                        <View style={styles.locationContainer}>
                            <MaterialCommunityIcons 
                                name="map-marker" 
                                size={15} 
                                color="blue" 
                                style={styles.mapMarker}
                            />
                            <Text style={styles.productLocation}>{product.location}</Text>
                        </View>

                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                        <View style={styles.line} />

                        <Text style={styles.productAvailable}>Available: {product.available}</Text>
                        <View style={styles.line} />
                        
                        <Text style={styles.productDescription}>{product.description}</Text>
                        <View style={styles.line} />

                        {hasAdditionalDetails && (
                            <Text style={styles.additionalDetailText}>Additional Details:</Text>
                        )}

                        {additionalDetails.every(detail => !detail.value) && (
                            <Text style={styles.noAdditionalDetailText}>No additional details available</Text>
                        )}

                        {additionalDetails.map((detail, index) => {
                            if (detail.value) {
                                return (
                                    <View key={index} style={styles.additionalDetailContainer}>
                                        <Text style={styles.additionalDetailLabel}>
                                        {`${detail.label}: `}
                                        </Text>
                                        <Text style={styles.additionalDetailValue}>
                                            {detail.value}
                                        </Text>
                                    </View>
                                );
                            }
                            return null; 
                        })}
                        
                    </View>

                    <View style={styles.farmerInfoContainer}>
                        <Text style={styles.farmerTitle}>Farmer Seller</Text>

                        <View style={styles.farmerInfo}>
                            <TouchableOpacity onPress={() => navigation.navigate('FarmerDetails', { farmer: farmer, product: product })}>
                                <Image
                                    source={farmer?.profile_pic ? { uri: farmer.profile_pic } : DEFAULT_PROFILE_IMAGE}
                                    style={styles.profileImage}
                                    resizeMode="cover" 
                                />
                            </TouchableOpacity>
                            <View style={styles.nameContainer}>
                                <Text style={styles.name}>
                                    {farmer ? `${(farmer.first_name || '').trim()} ${(farmer.middle_name || '').trim()} ${(farmer.last_name || '').trim()}${farmer.suffix ? `, ${farmer.suffix.trim()}` : ''}` : 'Farmer information not available'}
                                </Text>

                                <Text style={styles.farmerContactNumText}>
                                    {farmer ? formatPhoneNumberForDisplay(farmer.phone_number) : 'No contact number available'}
                                </Text>
                            </View>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
};

const VideoPlayer = ({ uri }) => {
    const player = useVideoPlayer(uri, player => {
        player.loop = true;
        player.play();
    });

    return (
        <View style={styles.videoContainer}>
            <VideoView style={styles.productVideo} player={player} allowsFullscreen allowsPictureInPicture />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    mainContainer: {
        flex: 1,
        padding: 20,
    },
    scrollContainer: {
        paddingBottom: 20, 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    imageContainer: {
        flex: 1,
        position: 'relative',
    },
    originalSizeButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 5,
    },
    productImage: {
        width: '100%',
        height: 300, 
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 60, 
    },
    productVideo: {
        width: '100%',
        height: 300, 
        backgroundColor: '#666',
        marginTop: 60 
    },
    carouselItem: {
        flex: 1,
        width: '100%',
    },
    backButton: {
        padding: 10,
    },
    line: {
        height: 1, 
        width: '100%', 
        backgroundColor: '#ddd', 
        marginTop: 10, 
    },
    productName: {
        fontSize: 18,
        fontFamily: 'medium',
    },
    productPrice: {
        fontSize: 16,
        fontFamily: 'regular',
        color: '#333',
        marginTop: 5,
    },
    productCategory: {
        fontSize: 14,
        fontFamily: 'regular',
        color: '#333',
        marginTop: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    mapMarker: {
        position: 'absolute', 
        left: 0,
        top: 0,
    },
    productLocation: {
        fontSize: 14,
        fontFamily: 'regular',
        color: 'blue',
        paddingLeft: 20,
        marginTop: 0,
    },
    productDescription: {
        fontSize: 16,
        color: '#333',
        marginTop: 10,
        marginBottom: 30,
    },
    additionalDetailContainer: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    additionalDetailLabel: {
        fontSize: 14,
        fontFamily: 'regular',
        color: 'green', 
    },
    additionalDetailValue: {
        fontSize: 14,
        fontFamily: 'regular',
        color: '#333',
    },
    additionalDetailText: {
        fontSize: 14,
        fontFamily: 'medium',
        color: 'black',
        marginTop: 5,
        marginBottom: 10,
    },
    noAdditionalDetailText: {
        fontSize: 13,
        fontFamily: 'regular',
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    productAvailable: {
        fontSize: 14,
        fontFamily: 'regular',
        color: '#333',
        marginTop: 5,
    },
    favoriteButton: {
        padding: 10,
    },
    infoContainer: {
        padding: 20, 
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noMediaContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 350,
    },
    videoContainer: {
        width: '100%',
        height: 'auto',
    },
    dotContainer: {
        position: 'absolute', 
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        margin: 4,
    },
    activeDot: {
        backgroundColor: 'green',
    },
    controlsContainer: {
        padding: 10,
    },
    farmerInfoContainer: {
        marginTop: 10,
        padding: 20,
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    farmerTitle: {
        fontSize: 14,
        fontFamily: "medium",
    },
    farmerInfo: {
        flexDirection: "row",
        alignItems: "center",
        margin: 10, 
    },
    farmerWrapper: {
        flexDirection: 'row',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "#34A853",
        backgroundColor: '#ddd',
        marginRight: 15,
    },
    nameContainer: {
        flex: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: "regular",
    },
    farmerContactNumText: {
        fontSize: 14,
        fontFamily: "regular",
        textDecorationLine: 'underline', 
    },
    wrapContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderButton: {
        backgroundColor: '#4CAF50',
        width: '48%',
        padding: 5,
        borderRadius: 20,
        marginTop: 20,
    },
    orderText:  {
        textAlign: 'center',
        fontFamily: 'regular',
        fontSize: 14,
        color: 'white',
    },
    feedbackContainer: {
        marginTop: 10,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    feedbackWrapper: {
        padding: 10,
    },
    inputContainer: {
        position: 'relative',
    },
    input: {
        borderRadius: 8,
        fontSize: 14,
        fontFamily: 'regular',
        color: '#444',
    },
    inputTag: {
        borderRadius: 8,
        fontSize: 12,
        fontFamily: 'regular',
        color: '#444',
    },
    note: { 
        fontSize: 10, 
        fontFamily: 'regular',
        color: '#888', 
    },
    inputText: {
        marginTop: 10,
        fontSize: 12,
        fontFamily: 'regular',
        color: '#000',
    },
    horizontalStars: {
        flexDirection: "row",
        padding: 20,
    },
    starContainer: {
        marginHorizontal: 5,
    },
    star: {
        fontSize: 20,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 5,
    },
    orderInputContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
    },
    orderInputLabel: {
        fontSize: 14,
        fontFamily: 'regular',
        marginBottom: 5,
    },
    orderInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    proceedButton: {
        marginTop: 20,
        backgroundColor: '#4CAF50',
        width: '80%',
        padding: 8,
        borderRadius: 20,
    },
    proceedButtonText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'regular',
        textAlign: 'center',
    },
});

export default FarmerProductViewer;