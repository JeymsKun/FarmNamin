import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, Image, StatusBar, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

const TipScreen = ({ route }) => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [noResultsMessage, setNoResultsMessage] = useState('');

    useEffect(() => {
        const clearMessage = () => {
            setShowInfoMessage(false);
        };

        let timer;
        if (showInfoMessage) {
            timer = setTimeout(clearMessage, 4000); 
        }

        return () => clearTimeout(timer); 
    }, [showInfoMessage]);
    


  return (
    <ScrollView style={styles.container} scrollEventThrottle={16}>
        <StatusBar hidden={false} />

        {/* Header */}
        <View style={styles.header}>
            <View style={styles.headerTitle}>
                <Text style={styles.headerTitleText}>Hello, {user?.first_name.trim() || 'User'}!</Text>
            </View>
            <View style={styles.headerGreet}>
                <Text style={styles.headerTitleText}>Look, Listen, and Learn</Text>
            </View>
        </View>

       {/* Welcome Container */}
       <View style={styles.welcomeContainer}>

            <View style={styles.rowWelcome}>
                <Text style={styles.titleWelcome}>Welcome to Agricultural Tips</Text>
                <TouchableOpacity onPress={() => setShowInfoMessage((prev) => !prev)}>
                    <AntDesign name="questioncircleo" size={14} color="black" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
                <Text style={styles.searchTitle}>Search Smartly: Your Ultimate Guide to Agricultural Tips</Text>

                <TextInput
                    style={styles.searchBar}
                    placeholder="Search agriculture tips..."
                    placeholderTextColor="#898989"
                />
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search" size={24} color="black" />
                </TouchableOpacity>
                </View>

            {/* Loading Indicator */}
            {loading && (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={30} color="#4CAF50" />
            </View>
            )}

            {/* No Results Found Message */}
            {noResults && !loading && (
                <View style={styles.noResultContainer}>
                    <Text style={styles.noResultsText}>No Result? Let Us Know What You Need 😊</Text>

                    <View style={styles.messageButton}>
                        <TouchableOpacity>
                            <Text style={styles.messageText}>Message us here</Text>
                        </TouchableOpacity>
                        <Ionicons name="chatbubble-ellipses" size={18} color="#007AFF" style={styles.chatIcon} />
                    </View>
                
                </View>
            )}

                


        </View>



    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {      
        paddingVertical: 20,
        paddingHorizontal: 20,      
        alignItems: 'flex-start',  
    },
    headerTitle: {
        marginBottom: 1,             
    },
    headerTitleText: {
        fontSize: 14,
        fontFamily: 'regular',
    },
    headerGreet: {
        marginTop: 1,                
    },
    headerGreetText: {
        fontSize: 14,
        fontFamily: 'regular',
        color: '#666',
    },
    welcomeContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    rowWelcome: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',  
        gap: 5, 
    },
    titleWelcome: {
        fontSize: 15,
        fontFamily: 'bold',
    },
    searchBarContainer: {
        position: 'relative',
        marginTop: height * 0.05,
    },
    searchTitle: {
        fontSize: 12,
        fontFamily: 'regular',
    },
    searchBar: {
        marginTop: 5,
        paddingHorizontal: width * 0.05,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D9D9D9',
        fontSize: width * 0.040,
        color: 'black',
        height: 45,
        fontFamily: 'medium',
    },
    searchButton: {
        position: 'absolute',
        right: 15,
        top: '50%',
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: height * 0.01,
    },
    noResultContainer: {
        marginTop: 100,
        padding: 10,
        justifyContent: 'center',
        marginHorizontal: 20,
    },
    noResultsText: {
        fontSize: 14,
        fontFamily: 'regular',
        marginBottom: 10,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 14,
        fontFamily: 'medium',
        color: '#2196F3', 
        marginRight: 5,
    },
    chatIcon: {
        marginLeft: 5,
    },

    
});


export default TipScreen;
