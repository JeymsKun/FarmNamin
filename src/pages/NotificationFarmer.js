import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { fetchConsumersWithOrders } from '../utils/api';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';

const { width, height } = Dimensions.get('window');

const NEWS_ICON = require('../../assets/notify/news.png');

const REPLY_ICON = require('../../assets/notify/reply.png');

const UPDATE_ICON = require('../../assets/notify/settings.png');

const PRODUCT_ICON = require('../../assets/notify/product.png');

class NotificationItem extends React.PureComponent {
    state = {
        isNew: true, 
    };

    componentDidMount() {
        const { created_at } = this.props.item;
        const currentDate = new Date();
        const orderDate = new Date(created_at);

        const timeDiff = currentDate - orderDate; 
        const twentyFourHours = 24 * 60 * 60 * 1000; 

        if (timeDiff <= twentyFourHours) {
            this.timer = setTimeout(() => {
                this.setState({ isNew: false });
            }, timeDiff);
        } else {
            this.setState({ isNew: false }); 
        }
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    render() {
        const { item, navigateToConsumerDetails } = this.props;
        const { isNew } = this.state;
        const latestOrderId = item.order_id;
        const fullName = `${item.consumer?.first_name} ${item.consumer?.middle_name ? item.consumer.middle_name + ' ' : ''}${item.consumer?.last_name} ${item.consumer?.suffix ? item.consumer.suffix : ''}`.trim();

        return (
            <TouchableOpacity style={styles.notifyCard} onPress={() => navigateToConsumerDetails(item)}>
                <View style={styles.notifyInfo}>
                    <View style={styles.titleWrapper}>
                        <Image source={PRODUCT_ICON} style={styles.notifyIcon} />
                        <Text style={styles.notifyTitle} numberOfLines={2} ellipsizeMode="tail">
                            Good day! You have a new order from your product.
                        </Text>
                    </View>

                    <View style={styles.descriptionWrapper}>
                        {latestOrderId ? (
                            <>
                                <Text style={styles.notifyDescription}>Order ID: {latestOrderId}</Text>
                                <Text style={styles.notifyDescription}>From: {fullName}</Text>
                            </>
                        ) : (
                            <Text style={styles.notifyDescription}>No recent orders.</Text>
                        )}
                    </View>
                </View>

                {isNew && (
                    <View style={styles.newNotificationCircle}>
                        <Text style={styles.newNotificationText}>New</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }
}

const NotificationScreen = () => {
    const { user } = useAuth();
    const userId = user?.id_user;
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    const { data: consumersData = [], isLoading: loadingConsumers, refetch: refetchConsumers } = useQuery({
        queryKey: ['consumersWithOrders', userId],
        queryFn: () => fetchConsumersWithOrders(userId), 
        staleTime: 1000 * 60 * 5,
    });

    const filterTodaysOrders = (orders) => {
        const today = new Date();
        return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return (
                orderDate.getDate() === today.getDate() &&
                orderDate.getMonth() === today.getMonth() &&
                orderDate.getFullYear() === today.getFullYear()
            );
        });
    };

    const todaysOrders = filterTodaysOrders(consumersData);

    console.log('check consumers:', consumersData);

    useRealTimeUpdates(userId);

    useFocusEffect(
        React.useCallback(() => {
            refetchConsumers();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        refetchConsumers()
            .finally(() => setRefreshing(false));
    };

    const navigateToConsumerDetails = (item) => {
        navigation.navigate('FarmerOrderConfirmation', { order: item });
    };

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={35} color="#34A853" />
                </TouchableOpacity>

                <Text style={styles.title}>Notification</Text>
            </View>
        );
    };

    return (
        <FlatList
            data={todaysOrders}
            renderItem={({ item }) => (<NotificationItem item={item} navigateToConsumerDetails={navigateToConsumerDetails} />)}
            keyExtractor={(item) => item.id_user ? item.id_user.toString() : `${item.order_id || Math.random()}`} 
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
                <View>
                    <StatusBar hidden={false} />
                    {renderHeader()}
                </View>
            }
            onRefresh={onRefresh}
            refreshing={refreshing}
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
        fontSize: 16,
        fontFamily: 'medium',
        textAlign: 'center',
    },
    notifyCard: {
        position: 'relative',
        maxWidth: '100%',
        flexWrap: 'wrap',
        marginTop: 10,
        backgroundColor: '#4CAF50',
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
    notifyInfo: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    descriptionWrapper:{
        padding: 10,
    },
    notifyDescription: {
        fontSize: 13,
        fontFamily: 'medium',
        color: 'white',
    },
    feedbackStar: {
        fontSize: 16,
        color: '#FFD700',
    },
    titleWrapper: {
        flexDirection: 'row',  
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    notifyIcon:{
        width: 40,
        height: 40,
    },
    notifyTitle: {
        borderRadius: 10,
        padding: 5,
        fontSize: 12,
        fontFamily: 'bold',
        color: 'white',
        marginLeft: 10, 
        flexShrink: 1,
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
    newNotificationCircle: {
        position: 'absolute',
        right: -5,
        top: -10,
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newNotificationText: {
        color: 'white',
        fontSize: 10,
        fontFamily: 'regular',
    },
});

export default NotificationScreen;
