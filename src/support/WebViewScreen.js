import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo'; 

const WebViewScreen = ({ route }) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true); 
    const [isLowNetwork, setIsLowNetwork] = useState(false); 
    const { url, title } = route.params;

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && state.details) {
  
                setIsLowNetwork(state.details.downlink < 1.5); 
            } else {
                setIsLowNetwork(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const rotateValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected && state.details) {
                setIsLowNetwork(state.details.downlink < 1.5); 
            } else {
                setIsLowNetwork(false);
            }
        });
 
        return () => unsubscribe();
    }, []);

    const goBack = () => {
        navigation.goBack(); 
    };

    const reload = () => {
        setLoading(true);

        Animated.loop(
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 1000, 
                useNativeDriver: true, 
            })
        ).start();

        setTimeout(() => {
            setLoading(false);

            rotateValue.stopAnimation();
            rotateValue.setValue(0); 
        }, 1000); 
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); 
        }, 3000); 

        return () => clearTimeout(timer); 
    }, []);

    const rotateAnimation = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'], 
    });

    return (
        <View style={styles.container}>
            <StatusBar hidden={false} />

            <View style={styles.header}>
                {/* Back Button */}
                <TouchableOpacity onPress={goBack}>
                    <Ionicons name="arrow-back" size={30} color="#4CAF50" />
                </TouchableOpacity>

                {/* Reload Button with Animation */}
                <TouchableOpacity onPress={reload}>
                    <Animated.View style={{ transform: [{ rotate: rotateAnimation }] }}>
                        <Ionicons name="reload" size={30} color="#4CAF50" />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* Loader: Show loading indicator when WebView is loading */}
            {loading && (
                <View style={[styles.loaderContainer, { top: '50%' }]}>
                    <ActivityIndicator size={40} color="#4CAF50" />
                </View>
            )}

            {/* If low network, show only the center part of the webpage */}
            {isLowNetwork ? (
                <View style={styles.lowNetworkContainer}>
                    <Text style={styles.lowNetworkText}>Slow Network Detected. Displaying the center of the page...</Text>
                    {/* This can be a simplified or fallback content view */}
                    <WebView
                        source={{ uri: url }}
                        style={styles.centeredWebView}
                    />
                </View>
            ) : (
                <WebView
                    source={{ uri: url }}
                    style={styles.fullWebView}
                    onLoadEnd={() => setLoading(false)} 
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
        height: 50, 
        backgroundColor: '#fff',
        elevation: 2,
        zIndex: 1, 
    },
    loaderContainer: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }], 
        zIndex: 2,
    },
    lowNetworkContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    lowNetworkText: {
        marginBottom: 20,
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
    centeredWebView: {
        width: '80%',
        height: '50%',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    fullWebView: {
        flex: 1,
    },
});

export default WebViewScreen;
