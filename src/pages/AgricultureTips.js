import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, Image, StatusBar, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import agricultureTipsData from '../support/agricultureTipData';


const { width, height } = Dimensions.get('window');

const AgricultureTipsScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTips, setFilteredTips] = useState([]);
    const [selectedTip, setSelectedTip] = useState(null); 

    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            setFilteredTips([]); 
            setSelectedTip(null); 
            return; 
        }

        setLoading(true); 
        setNoResults(false); 

        setTimeout(() => {
            const filtered = agricultureTipsData.filter(tip =>
                tip.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            setFilteredTips(filtered);
            setLoading(false); 

            if (filtered.length === 0) {
                setNoResults(true);
            }
        }, 1000); 
    };

    const handlePressTip = (tip) => {
        setSelectedTip(tip); 
        setFilteredTips([]); 
    };

    const handleBackToSearch = () => {
        setSelectedTip(null); 
        setSearchQuery(''); 
    };

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

    const handleReadMore = () => {
        if (selectedTip) {
            navigation.navigate('WebBrowser', { url: selectedTip.link }); 
        }
    };

  return (
    <ScrollView style={styles.container} scrollEventThrottle={16}>
        <StatusBar hidden={false} />

        <View style={styles.header}>
            <View style={styles.headerTitle}>
                <Text style={styles.headerTitleText}>Hello, {user?.first_name.trim() || 'User'}!</Text>
            </View>
            <View style={styles.headerGreet}>
                <Text style={styles.headerTitleText}>Look, Listen, and Learn</Text>
            </View>
        </View>

       <View style={styles.welcomeContainer}>

            <View style={styles.rowWelcome}>
                <Text style={styles.titleWelcome}>Welcome to Agricultural Tips</Text>
            </View>

            <View style={styles.searchBarContainer}>
                <Text style={styles.searchTitle}>Search Smartly: Your Ultimate Guide to Agricultural Tips</Text>

                <TextInput
                    style={styles.searchBar}
                    placeholder="Search agriculture tips..."
                    placeholderTextColor="#898989"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="search" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size={30} color="#4CAF50" />
                </View>
            )}

            {noResults && !loading && (
                <View style={styles.noResultContainer}>
                    <Text style={styles.noResultsText}>No Result? Let Us Know What You Need 😊</Text>
                    <View style={styles.messageButton}>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:maserin.jamesdavid000@gmail.com ')}>
                            < Text style={styles.messageText}>Message us here</Text>
                        </TouchableOpacity>
                        <Ionicons name="chatbubble-ellipses" size={18} color="#007AFF" style={styles.chatIcon} />
                    </View>
                </View>
            )}

            {!selectedTip && filteredTips.length > 0 && (
                filteredTips.map((tip) => (
                    <View key={tip.title} style={styles.tipContainer}>
                        <TouchableOpacity onPress={() => handlePressTip(tip)}>
                            <Text style={styles.tipTitle}>{tip.title}</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}

            {selectedTip && (
                <View style={styles.tipDetailsContainer}>
                    <Text style={styles.tipName}>{selectedTip.title}</Text>
                    <Text style={styles.tipSource}>By: {selectedTip.source}</Text>
                    <Text style={styles.tipDescription}>{selectedTip.description}</Text>
                    <TouchableOpacity onPress={handleReadMore}>
                        <Text style={styles.tipLink}>Read more here</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleBackToSearch}>
                        <Text style={styles.backToSearch}>Back to Search</Text>
                    </TouchableOpacity>
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
    tipContainer: {
        marginTop: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
    },
    tipTitle: {
        fontFamily: 'medium',
        fontSize: 14,
    },
    tipDetailsContainer: {
        marginTop: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
    },
    tipName: {
        fontFamily: 'medium',
        fontSize: 14,
        textAlign: 'center',
    },
    tipSource: {
        fontFamily: 'medium',
        fontSize: 12,
        textAlign: 'center',
        color: '#4CAF50',
    },
    tipDescription: {
        fontFamily: 'regular',
        fontSize: 13,
    },
    tipLink: {
        margin: 10,
        fontFamily: 'regular',
        fontSize: 13,
        textDecorationLine: 'underline',
        color: 'blue',
    },
    backToSearch: {
        margin: 10,
        fontFamily: 'medium',
        fontSize: 13,
        textDecorationLine: 'underline',
        color: 'green',
    },
    
});


export default AgricultureTipsScreen;
