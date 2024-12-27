import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useVideoPlayer, VideoView } from 'expo-video'; 
import Carousel from 'react-native-reanimated-carousel';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { fetchUserFavorites } from '../utils/api';
import { supabase } from '../backend/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { addFavorite } from '../store/favoritesSlice'; 
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';
import CustomAlert from '../support/CustomAlert';

const { width } = Dimensions.get('window');

const ProductViewer = ({ route, navigation }) => {
    const { product, isFavorite } = route.params; 
    const { user } = useAuth();
    const dispatch = useDispatch();
    const [originalImageUri, setOriginalImageUri] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [isMarked, setIsMarked] = useState(isFavorite);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    useRealTimeUpdates(user?.id_user);

    const { data: favoriteProducts } = useQuery({
        queryKey: ['favorites', user?.id_user], 
        queryFn: () => fetchUserFavorites(user.id_user), 
        enabled: !!user,
        staleTime: 1000 * 60 * 5, 
    });

    useEffect(() => {
        if (favoriteProducts) {
            const isFavorite = favoriteProducts.some(fav => fav.product.id === product.id && fav.is_bookmarked);
            setIsMarked(isFavorite); 
        }
    }, [favoriteProducts, product.id]);

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

    const handleMarkProduct = async () => {
        if (!user || !user.id_user) {
            console.error('User  is not authenticated or user ID is missing');
            return; 
        }

        if (isLocked) return;

        setIsLocked(true);

        try {
            const newIsMarked = !isMarked;
            setIsMarked(newIsMarked);

            if (newIsMarked) {
                const { error } = await supabase
                    .from('favorites') 
                    .insert([{ product_id: product.id, id_user: user.id_user, is_bookmarked: true }]); 

                if (error) throw new Error(error.message);

                dispatch(addFavorite({ id: product.id })); 
                setAlertMessage('Added to favorites successfully!');
            }

            setAlertVisible(true);
        } catch (err) {
            console.error('Error updating favorites:', err.message);
            setIsMarked(!isMarked);
        } finally {
            setIsLocked(false); 
        }
    };

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

                    <TouchableOpacity style={styles.favoriteButton} onPress={handleMarkProduct}>
                        <Ionicons name={isMarked ? "bookmark" : "bookmark-outline"} size={28} color="green" />
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
                                    onPress={() => setOriginalImageUri(mediaItems[0].uri)}
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
                                                    onPress={() => setOriginalImageUri(item.uri)}
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
                
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                    <View style={styles.line} />

                    <Text style={styles.productCategory}>Category: {product.category}</Text>
                    <Text style={styles.productAvailable}>Available: {product.available}</Text>
                    <View style={styles.line} />

                    <View style={styles.locationContainer}>
                        <MaterialCommunityIcons 
                            name="map-marker" 
                            size={20} 
                            color="#555" 
                            style={styles.mapMarker}
                        />
                        <Text style={styles.productLocation}>{product.location}</Text>
                    </View>
                    
                    <Text style={styles.productDescription}>{product.description}</Text>
                    <View style={styles.line} />

                    {hasAdditionalDetails && (
                        <Text style={styles.additionalDetailText}>Additional Details:</Text>
                    )}

                    {additionalDetails.every(detail => !detail.value) && (
                        <Text style={styles.noAdditionalDetailText}>No additional details available</Text>
                    )}

                    {additionalDetails.every(detail => !detail.value) && (
                        <View style={styles.line} />
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

                    {hasAdditionalDetails && (
                        <View style={styles.line} />
                    )}

                    <View style={styles.farmerInfoContainer}>
                        <Text style={styles.farmerTitle}>Farmer Seller</Text>

                        <View style={styles.farmerInfo}>
                            <View style={styles.farmerWrapper}>
                                <Text>here farmer profile</Text>

                            </View>

                                <Text style={styles.farmerFullname}>here farmer's full name</Text>
                                <Text style={styles.farmerContactNum}>here farmer's contact number</Text>
                        </View>

                    </View>
                </View>
            </ScrollView>

            {originalImageUri && (
                <View style={styles.fullscreenImageContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setOriginalImageUri(null)}>
                        <Ionicons name="close" size={35} color="green" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: originalImageUri }}
                        style={styles.fullscreenImage}
                        resizeMode="contain"
                    />
                </View>
            )}
            <CustomAlert 
                visible={alertVisible} 
                title="Favorite Status" 
                message={alertMessage} 
                onClose={() => setAlertVisible(false)}
            />
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
        backgroundColor: '#fff',
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
    fullscreenImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    closeButton: {
        zIndex: 5,
        position: 'absolute',
        top: 40,
        right: 40,
    },
    fullscreenImage: {
        width: '100%',
        height: '100%',
    },
    productImage: {
        width: '100%',
        height: 450, 
        borderWidth: 1,
        borderColor: '#ddd',
        marginTop: 60, 
    },
    productVideo: {
        width: '100%',
        height: 450, 
        borderWidth: 1,
        borderColor: '#ddd',
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
        marginTop: 10,
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
        paddingLeft: 24,
        marginTop: 0,
    },
    productDescription: {
        fontSize: 16,
        color: '#333',
        marginTop: 30,
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
});

export default ProductViewer;