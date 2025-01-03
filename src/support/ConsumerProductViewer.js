import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useVideoPlayer, VideoView } from 'expo-video'; 
import Carousel from 'react-native-reanimated-carousel';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { fetchUserFavorites, fetchFarmers, fetchAllProducts } from '../utils/api';
import { supabase } from '../backend/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { addFavorite } from '../store/favoritesSlice'; 
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';
import CustomAlert from './CustomAlert';

const { width } = Dimensions.get('window');

const ConsumerProductViewer = ({ route, navigation }) => {
    const { product: initialProduct, isFavorite, id_user } = route.params;
    const { user } = useAuth();
    const dispatch = useDispatch();
    const [tag, setTag] = useState('');
    const [rating, setRating] = useState(0);
    const [description, setDescription] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [isMarked, setIsMarked] = useState(isFavorite);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState(''); 
    const [isLocked, setIsLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [showOrderInput, setShowOrderInput] = useState(false); 
    const [quantity, setQuantity] = useState('');
    const [product, setProduct] = useState(initialProduct);

    useRealTimeUpdates(user?.id_user);

    const { data: farmersData = [], isLoading: loadingFarmers, refetch: refetchFarmers } = useQuery({
        queryKey: ['farmers', id_user],
        queryFn: () => fetchFarmers(id_user),
        staleTime: 1000 * 60 * 5,
    });

    const { data: favoriteProducts, refetch: refetchFavoriteProducts } = useQuery({
        queryKey: ['favorites', user?.id_user], 
        queryFn: () => fetchUserFavorites(user.id_user), 
        enabled: !!user,
        staleTime: 1000 * 60 * 5, 
    });

    const { data: fetchProducts = [], refetch: refetchAllProducts} = useQuery({
        queryKey: ['products'], 
        queryFn: fetchAllProducts,
        staleTime: 1000 * 60 * 5, 
    });

    useFocusEffect(
        React.useCallback(() => {
            const fetchUpdatedProductData = async () => {
                try {
                    const updatedProducts = await fetchAllProducts();
                    const updatedProduct = updatedProducts.find(prod => prod.id === product.id);
                    if (updatedProduct) {
                        setProduct(updatedProduct);
                    }
                } catch (error) {
                    console.error("Error fetching updated product data:", error);
                }
            };

            setShowOrderInput(false);
            refetchFarmers();
            refetchAllProducts();
            refetchFavoriteProducts();
            fetchUpdatedProductData();
        }, [product.id])
    );

    useEffect(() => {
        if (favoriteProducts) {
            const isFavorite = favoriteProducts.some(fav => fav.product.id === product.id && fav.is_bookmarked);
            setIsMarked(isFavorite); 
        }
    }, [favoriteProducts, product.id]);

    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

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
                showAlert("Favorite Status", "Added to favorites successfully!");
            } else {
 
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('product_id', product.id)
                    .eq('id_user', user.id_user);
    
                if (error) throw new Error(error.message);
    
                showAlert("Favorite Status", "Removed from favorites successfully!");
            }
    
            await refetchFavoriteProducts();
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

    const DEFAULT_PROFILE_IMAGE = require('../../assets/main/default_profile_photo.png');

    const formatPhoneNumberForDisplay = (phoneNumber) => {
        if (phoneNumber && phoneNumber.length === 10 && phoneNumber[0] !== '0') {
            return '0' + phoneNumber;
        }
        return phoneNumber;
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starContainer}
            >
                <Text
                    style={[
                        styles.star,
                        { color: star <= rating ? "#FFD700" : "#666", borderColor: "#555" },
                    ]}
                >
                ★
                </Text>
            </TouchableOpacity>
        ));
    };

    const handleFeedbackSubmit = async (farmerId) => {
        if (!user || !user.id_user) {
            console.error('User is not authenticated or user ID is missing');
            return;
        }

        if (user.role !== 'consumer') {
            showAlert("Feedback Submission Error", "Only consumers can submit feedback.");
            return;
        }
    
        if (rating === 0) {
            showAlert("Feedback Submission Error", "Please provide a rating.");
            return;
        }

        if (!tag || tag.trim() === '') {
            showAlert("Feedback Submission Error", "Please provide a tag.");
            return;
        }
    
        if (!description || description.trim() === '') {
            showAlert("Feedback Submission Error", "Please provide a description.");
            return;
        }

        setIsLoadingFeedback(true);
    
        try {
            const { error } = await supabase
                .from('feedback')
                .insert([{
                    consumer_id: user.id_user, 
                    farmer_id: farmerId, 
                    rating: rating,
                    tags: tag, 
                    description: description,
                }]);
    
            if (error) throw new Error(error.message);

            setRating(0);
            setDescription('');
            setTag('');
            showAlert("Feedback Submission", "Feedback submitted successfully!");
        } catch (err) {
            console.error('Error submitting feedback:', err.message);
            showAlert("Feedback Submission Error", "Failed to submit feedback. Please try again.");
        } finally {
            setIsLoadingFeedback(false);
        }
    };

    const handleOrderNow = () => {
        setShowOrderInput(true);
    };

    const handleProceed = () => {
        if (!quantity || quantity.trim() === '') {
            showAlert("Order Error", "Please enter a valid quantity.");
            return;
        }

        const orderId = Math.floor(Math.random() * 100000).toString();
    
        const orderData = {
            orderId,
            product: product.name, 
            productLocation: product.location,
            price: formatPrice(product.price), 
            quantity: parseFloat(quantity),
            totalPrice: formatPrice(parseFloat(quantity) * parseFloat(product.price)), 
            farmerName: farmersData[0].first_name + farmersData[0].last_name,
            farmerContact: formatPhoneNumberForDisplay(farmersData[0].phone_number),
            farmer_id: farmersData[0].id_user,
            productId: product.id,
        };

        console.log('Order Data:', orderData);
    
        navigation.navigate('ConsumerOrder', { orderData });
    };

    const handleCancelOrder = () => {
        setShowOrderInput(false); 
        setQuantity(''); 
    };

    const formatUnitPrice = (unitPrice) => {
        const priceMatch = unitPrice.match(/(\d+(\.\d+)?)/); 
        const unitDescription = unitPrice.replace(priceMatch[0], '').trim(); 
        const formattedPrice = priceMatch ? formatPrice(priceMatch[0]) : 'P 0.00'; 
        return `${formattedPrice} ${unitDescription}`; 
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

                        <Text style={styles.productCategory}>Category: {product.category}</Text>
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
                    
                    {farmersData.length > 0 && (
                        <View style={styles.farmerInfoContainer}>
                            <Text style={styles.farmerTitle}>Farmer Seller</Text>
                            {loadingFarmers ? (
                                <ActivityIndicator size={25} color="white" />
                            ) : (
                                farmersData.map(farmer => (
                                    <View key={farmer.id_user} style={styles.farmerInfo}>
                                        <TouchableOpacity onPress={() => navigation.navigate('FarmerDetails', { farmer: farmer, product: product })}>
                                            <Image
                                                source={farmer?.profile_pic ? { uri: farmer.profile_pic } : DEFAULT_PROFILE_IMAGE}
                                                style={styles.profileImage}
                                                resizeMode="cover" 
                                            />
                                        </TouchableOpacity>
                                        
                                        <View style={styles.nameContainer}>
                                            <Text style={styles.name}>
                                                {`${(farmer.first_name || '').trim()} ${(farmer.middle_name || '').trim()} ${(farmer.last_name || '').trim()}${farmer.suffix ? `, ${farmer.suffix.trim()}` : ''}`}
                                            </Text>

                                            <Text style={styles.farmerContactNumText}>
                                                {formatPhoneNumberForDisplay(farmer.phone_number) || 'No contact number available'}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}

                            <View style={styles.wrapContainer}>
                                <TouchableOpacity style={styles.orderButton} onPress={showOrderInput ? handleCancelOrder : handleOrderNow}>
                                    {isLoading ? (
                                        <ActivityIndicator size={24} color="white" />
                                    ) : (
                                        <Text style={styles.orderText}>{showOrderInput ? 'Cancel Order' : 'Order Now'}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {showOrderInput && (
                                <View style={styles.orderInputContainer}>

                                    {(() => {
                                        const availableMatch = product.available.match(/(\d+(\.\d+)?)/);
                                        const availableQuantity = availableMatch ? parseFloat(availableMatch[1]) : 0; 
                                        const adjustedAvailable = quantity ? (availableQuantity - parseFloat(quantity)).toFixed(2) : availableQuantity.toFixed(2);
                                        const displayAvailable = adjustedAvailable < 0 ? '0.00' : adjustedAvailable; 

                                        return (
                                            <Text style={styles.orderInputLabel}>
                                                Available: {displayAvailable} kg
                                            </Text>
                                        );
                                    })()}

                                    <Text style={styles.orderInputLabel}>Unit Price: {formatUnitPrice(product.unit_price)}</Text>
                                    <Text style={styles.orderInputLabel}>
                                        Total: {formatPrice(quantity ? (parseFloat(quantity) * parseFloat(product.unit_price)).toFixed(2) : '0.00')}
                                    </Text>
                                    <Text style={styles.orderInputLabel}>Enter Quantity:</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Add Quantity"
                                        value={quantity}
                                        onChangeText={text => {
                                            const numericValue = text.replace(/[^0-9.]/g, '');
                                            const parsedValue = parseFloat(numericValue);

                                            const availableMatch = product.available.match(/(\d+(\.\d+)?)/);
                                            const availableQuantity = availableMatch ? parseFloat(availableMatch[1]) : 0;

                                            if (parsedValue > availableQuantity) {
                                                setQuantity(availableQuantity.toFixed(2)); 
                                            } else {
                                                setQuantity(numericValue); 
                                            }
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <View style={{ borderBottomWidth: 1, borderColor: '#ddd' }} />

                                    <View style={styles.wrapContainer}>
                                        <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
                                            {isLoading ? (
                                                <ActivityIndicator size={24} color="white" />
                                            ) : (
                                                <Text style={styles.proceedButtonText}>Proceed</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                        </View>
                    )}

                    {farmersData.length > 0 && (
                        <View style={styles.feedbackContainer}>
                            {farmersData.map(farmer => (
                                <View key={farmer.id_user} style={styles.feedbackWrapper}>
                                    <Text style={styles.farmerTitle}>Feedback for {farmer.first_name}</Text>

                                    <View style={styles.ratingContainer}>
                                        <View style={styles.horizontalStars}>{renderStars()}</View>
                                    </View>
                                    
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputText}>Share your tags that describe your experience.</Text>
                                        <Text style={styles.note}>Note: Tags are limited to 5 words.</Text>
                                        <TextInput
                                            style={styles.inputTag}
                                            placeholder='Add Tag (e.g., Easy to Negotiate, Low Price, etc.)'
                                            value={tag}
                                            onChangeText={setTag}
                                        />
                                        <View style={{borderBottomWidth: 1, borderColor: '#ddd' }}/>
                                        <Text style={styles.inputText}>Share your experience.</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder='Add Description'
                                            value={description}
                                            onChangeText={setDescription}
                                            multiline
                                        />
                                        <View style={{borderBottomWidth: 1, borderColor: '#ddd' }}/>
                                    </View>
                                    
                                    <View style={styles.wrapContainer}>
                                        <TouchableOpacity 
                                            style={styles.orderButton} 
                                            onPress={() => handleFeedbackSubmit(farmer.id_user)} 
                                        >
                                            {isLoadingFeedback ? (
                                                <ActivityIndicator size={24} color="white" />
                                            ) : (
                                                <Text style={styles.orderText}>Give Feedback</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
            
            <CustomAlert 
                visible={alertVisible} 
                title={alertTitle} 
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
    ratingContainer: {
        marginTop: 20,
        alignItems: 'center',
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

export default ConsumerProductViewer;