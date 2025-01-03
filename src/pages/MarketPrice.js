import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, StatusBar, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../hooks/useAuth';
import marketData from '../support/marketData';
import searchData from '../support/searchData';

const { width, height } = Dimensions.get('window');

const MarketScreen = ({ route }) => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [noResultsMessage, setNoResultsMessage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const categories = marketData.categories;

    const getProductsForCategory = (categoryValue) => {
        const category = marketData.categories.find(cat => cat.value === categoryValue);
        return category ? category.products : [];
    };

    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            setFilteredSuggestions([]); 
            return; 
        }

        setLoading(true);
        setNoResults(false);

        setTimeout(() => {
            const filtered = Object.entries(searchData).reduce((acc, [title, types]) => {
                const matchingTypes = types.filter(product =>
                    product.type.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (matchingTypes.length > 0) {
                    acc.push({ title, types: matchingTypes });
                }
                return acc;
            }, []);

            setFilteredSuggestions(filtered);
            setLoading(false); 

            if (filtered.length === 0) {
                setNoResults(true);
            }
        }, 1000); 
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

    const handlePress = (url, text) => {
     
        navigation.navigate('WebBrowser', {
            url: url,
            title: text, 
        });
    }; 

    const BulletLink = ({ text, url, stylePagasa }) => (
        <TouchableOpacity onPress={() => handlePress(url, text)}>
            <View style={{ alignItems: 'center' }}>
                <Text style={[styles.linkText, stylePagasa]}>
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    );



  return (

        <ScrollView style={styles.container} scrollEventThrottle={16}>
            <StatusBar hidden={false} />

            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Text style={styles.headerTitleText}>Good Day, {user?.first_name.trim() || 'User'}!</Text>
                </View>
                <View style={styles.headerGreet}>
                    <Text style={styles.headerTitleText}>Ready to check the latest prices for your goods?</Text>
                </View>
            </View>

            <View style={styles.marketPriceContainer}>
                <View style={styles.rowMarket}>
                    <Text style={styles.titleMarket}>Agriculture and Fishery Market Price</Text>
                </View>
            </View>

            <View style={styles.placeholderContainer}>
                <View style={styles.rowLatest}>
                    <Text style={styles.titleLatest}>Latest Market Price</Text>
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    >
                        <Picker.Item label="Select a category" value="" />
                        {categories.map((category) => (
                            <Picker.Item key={category.value} label={category.label} value={category.value} />
                        ))}
                    </Picker>
                </View>

                <View style={styles.priceHolder}>
                    {selectedCategory ? (
                        getProductsForCategory(selectedCategory).map((product, index) => (
                            <View key={index} style={styles.productRow}>
                                <Text style={[styles.productText, product.name.length >= 8 ? styles.productTextSmall : styles.productTextNormal]}>
                                    {product.name}
                                </Text>
                                <View style={styles.currentPriceContainer}>
                                    <Ionicons 
                                        name={product.prevailingPrice >= product.highPrice ? "arrow-up" : "arrow-down"} 
                                        size={16} 
                                        color={product.prevailingPrice >= product.highPrice ? "green" : "red"} 
                                    />
                                    <Text style={styles.productTextPrice}>₱ {product.prevailingPrice.toFixed(2)}</Text>
                                </View>
                                <View style={styles.highLowContainer}>
                                    <Ionicons name="arrow-up" size={14} color="green" />
                                    <Text style={styles.productTextPriceHighLow}>₱ {product.highPrice.toFixed(2)}</Text>
                                    <Ionicons name="arrow-down" size={14} color="red" />
                                    <Text style={styles.productTextPriceHighLow}>₱ {product.lowPrice.toFixed(2)}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.selectText}>
                            <Text style={styles.select}>Please select a category to see the products and prices.</Text>
                        </View>
                    )}
                </View>
            </View>

                <View style={styles.marketContainer}>

                    <View style={styles.searchBarContainer}>
                        <Text style={styles.searchTitle}>2025 Price Estimates for Key Agricultural Products: What to Expect</Text>

                        <TextInput
                            style={styles.searchBar}
                            placeholder="Search..."
                            placeholderTextColor="#898989"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                            <Ionicons name="search" size={30} color="black" />
                        </TouchableOpacity>
                    </View>

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size={30} color="#4 CAF50" />
                        </View>
                    )}

                    {filteredSuggestions.map((item, index) => (
                        <View key={index} style={styles.productContainer}>
                            <Text style={styles.productTitle}>{item.title}</Text>
                            <View style={styles.productWrapper}>
                                {item.types.map((type, idx) => (
                                    <View key={idx} style={styles.productTypeContainer}>
                                        <Text style={styles.productType}>
                                            {type.type}:
                                        </Text>
                                        <Text style={styles.productPrice}>
                                            ₱ {type.lowPrice.toFixed(2)} - ₱ {type.highPrice.toFixed(2)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}

                    {!loading && noResults && filteredSuggestions.length === 0 && (
                        <View style={styles.noResultContainer}>
                            <Text style={styles.noResultsText}>No Result? Let Us Know What You Need 😊</Text>
                            <View style={styles.messageButton}>
                                <TouchableOpacity onPress={() => Linking.openURL('mailto:maserin.jamesdavid000@gmail.com ')}>
                                    <Text style={styles.messageText}>Message us here</Text>
                                </TouchableOpacity>
                                <Ionicons name="chatbubble-ellipses" size={18} color="#007AFF" style={styles.chatIcon} />
                            </View>
                        </View>
                    )}

            </View>

            <View style={styles.informationContainer}>
                <Text style={styles.titleInformation}>For more information? Visit Them.</Text>

                <View style={styles.wrapperInformation}>
                    <BulletLink text="Price Monitoring | DA Region 10 " stylePagasa={{ fontSize: 14 }} url="https://cagayandeoro.da.gov.ph/?page_id=55148"/>
                </View>
                <View style={styles.wrapperInformation}>
                    <BulletLink text="PH | Retail Price: Selected Agricultural Commodities | CEIC " stylePagasa={{ fontSize: 11 }} url="https://www.ceicdata.com/en/philippines/retail-price-selected-agricultural-commodities?page=2"/>
                </View>
                <View style={styles.wrapperInformation}>
                    <BulletLink text="Bantay Presyo" stylePagasa={{ fontSize: 14 }} url="http://www.bantaypresyo.da.gov.ph/tbl_veg.php"/>
                </View>
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
    marketPriceContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    placeholderContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    rowLatest: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',  
        gap: 5, 
    },
    titleLatest: {
        fontSize: 14,
        fontFamily: 'regular',
    },
    pickerContainer: {
        marginTop: 10,
        height: 50,
        width: '100%',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D9D9D9',
        overflow: 'hidden', 
    },
    marketContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    rowMarket: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',  
        gap: 5, 
    },
    titleMarket: {
        fontSize: 14,
        fontFamily: 'bold',
    },
    searchBarContainer: {
        position: 'relative',
        marginTop: 10,
    },
    searchTitle: {
        fontSize: 11,
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
        bottom: 8,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    noResultContainer: {
        margin: 50,
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
    linkText: {
        color: '#2196F3',
        textDecorationLine: 'underline',
        fontFamily: 'regular',
    },
    informationContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },  
    titleInformation: {
        fontSize: 14,
        fontFamily: 'medium',
    },
    wrapperInformation: {
        marginTop: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        elevation: 2, 
    },
    priceHolder: {
        marginTop: 20,
        padding: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D9D9D9',
        width: '100%',
        height: 250,
    },
    productContainer: {
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        elevation: 2, 
    },
    productTitle: {
        fontSize: 14,
        fontFamily: 'medium',
        textAlign: 'center',
    },
    productType: {
        fontSize: 14,
        fontFamily: 'regular',
    },
    productPrice: {
        fontSize: 14,
        fontFamily: 'regular',
        color: '#000', 
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', 
        paddingVertical: 5, 
    },
    productWrapper: {
        marginBottom: 15,
    },
    productTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
    },
    productText: {
        fontSize: 14,
        fontFamily: 'regular',
        flex: 1,
    },
    productTextNormal: {
        fontSize: 14,
    },
    productTextSmall: {
        fontSize: 11, 
    },
    currentPriceContainer: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
    },
    productTextPrice: {
        fontSize: 14,
        fontFamily: 'medium',
        marginLeft: 5, 
    },
    highLowContainer: {
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'space-between', 
    },
    productTextPriceHighLow: {
        fontSize: 12,
        fontFamily: 'regular',
        marginRight: 5,
    },
    selectText: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    select: {
        fontSize: 12,
        fontFamily: 'regular',
    },
});


export default MarketScreen;
