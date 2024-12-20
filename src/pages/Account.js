import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Animated, Modal } from 'react-native';
import { BackHandler } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../backend/supabaseClient';

const { width, height } = Dimensions.get('window');

export default function FinancialAccount({ navigation }) {
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showNoData, setShowNoData] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [showCheckbox, setShowCheckbox] = useState(false);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const subscriptionRef = useRef(null);

    const loadSelectedAccounts = async () => {
        try {
            const storedAccounts = await AsyncStorage.getItem('selectedAccounts');
            if (storedAccounts) {
                setSelectedAccounts(JSON.parse(storedAccounts));
            }
        } catch (error) {
            console.error('Failed to load selected accounts:', error);
        }
    };

    const saveSelectedAccounts = async (accounts) => {
        try {
            await AsyncStorage.setItem('selectedAccounts', JSON.stringify(accounts));
        } catch (error) {
            console.error('Failed to save selected accounts:', error);
        }
    };

    useEffect(() => {
        loadSelectedAccounts();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
    
        try {
            const { data, error } = await supabase
                .from('financiallogs')
                .select('main_log_id, account, description, amount, type, record_date');
    
            if (error) {
                console.error('Error fetching accounts:', error);
                return;
            }
    
            if (data && data.length > 0) {
                const uniqueData = Object.values(
                    data.reduce((acc, item) => {
                        if (!acc[item.account]) acc[item.account] = item;
                        return acc;
                    }, {})
                );
    
                console.log('Fetched unique accounts:', uniqueData);
                setAccounts(uniqueData);
            }
        } catch (err) {
            console.error('Unexpected error loading data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const listenForChanges = async () => {
        if (subscriptionRef.current) return;
        try {
           
            const subscription = supabase
                .channel('database_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'financiallogs' }, async (payload) => {
                    console.log('Database change detected:', payload);
    
                    try {
                        await loadData();  
                    } catch (reloadErr) {
                        console.error('Error reloading data after database change:', reloadErr);
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('Successfully subscribed to financiallogs changes.');
                    }
                });
    
            return subscription;
        } catch (err) {
            console.error('Error subscribing to database changes:', err);
        }
    };

    useEffect(() => {
        loadData().then(() => {
            listenForChanges();
        });
    
        return () => {
 
            if (subscriptionRef.current) {
                supabase.removeSubscription(subscriptionRef.current);
                subscriptionRef.current = null;
            }
        };
    }, []);


    useEffect(() => {
        const backAction = () => {
            navigation.navigate('Finance');
            return true;
        };

        BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
    }, []);


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


    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            }
        }, 300);
        
        return () => clearTimeout(debounceSearch);
    }, [searchQuery]);


    useEffect(() => {
        if (searchQuery.trim() === "") {
            setResults([]); 
            setIsSearchActive(false); 
        }
    }, [searchQuery]);
    

    const handleSearch = async () => {
        setIsLoading(true);
        const normalizeString = (str) => str.trim().toLowerCase();
        const normalizedQuery = normalizeString(searchQuery);

        const filteredResults = accounts.filter((item) =>
            normalizeString(item.account).includes(normalizedQuery)
        );

        if (filteredResults.length > 0) {
            setResults(filteredResults);
        } 
        setIsLoading(false);
    };
      

    const handleOutsideClick = () => {
        if (pop) {
            popOut(); 
            setShowCheckbox(false);
            setShowDeleteIcons(false);
            
        }
        if (isSearchActive) {
            setIsSearchActive(false); 
            setSearchQuery(""); 
            setResults([]);
            Keyboard.dismiss(); 
        }
    };    

    const [icon_1] = useState(new Animated.Value(40));
    const [icon_2] = useState(new Animated.Value(40));
    const [icon_3] = useState(new Animated.Value(40));
    const [rotation] = useState(new Animated.Value(0));

    const [pop, setPop] = useState(false);
    const [activePop, setActivePop] = useState(null);

    const popIn = () => {
        setPop(true);
        Animated.timing(icon_1,{
            toValue: 110,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
        Animated.timing(icon_2,{
            toValue: 95,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
        Animated.timing(icon_3,{
            toValue: 110,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
        Animated.timing(rotation, {
            toValue: 1, 
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
        }).start();
    }

    const popOut = () => {
        setPop(false);
        setShowDeleteIcons(false); 
        setShowCheckbox(false);
        Animated.timing(icon_1,{
            toValue: 40,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
        Animated.timing(icon_2,{
            toValue: 40,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
        Animated.timing(icon_3,{
            toValue: 40,
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
        Animated.timing(rotation, {
            toValue: 0, 
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
        }).start();
    }
    
    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'], 
    });

    const toggleAccountSelection = (account, event) => {
        event.stopPropagation();
    
        setSelectedAccounts((prev) => {
            const isSelected = prev.some(item => item === account.account);
            const newSelectedAccounts = isSelected
                ? prev.filter(item => item !== account.account) 
                : [...prev, account.account]; 

            saveSelectedAccounts(newSelectedAccounts); 

            return newSelectedAccounts;
        });
    };
    
    useEffect(() => {
        navigation.setParams({ selectedAccounts });
    }, [selectedAccounts]);

    const deleteAccountHandler = async (accountName) => {
        setIsLoading(true); 
    
        try {
            
            const { error } = await supabase
                .from('financiallogs')
                .delete()
                .eq('account', accountName); 
            if (error) {
                console.error('Error deleting account records:', error);
                return;
            }

            setAccounts((prevAccounts) => prevAccounts.filter(account => account.account !== accountName));
    
        } catch (err) {
            console.error('Unexpected error deleting account records:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const confirmDelete = () => {
        if (accountToDelete) {
            deleteAccountHandler(accountToDelete.account); 
            setAccountToDelete(null); 
            setShowDeleteConfirmationModal(false);
        }
    };   


    const handleDeleteIconPress = (account) => {
        setAccountToDelete(account); 
        setShowDeleteConfirmationModal(true);
    };

    const toggleDeleteIcons = () => {
        if (showDeleteIcons) {
            setShowDeleteIcons(false); 
            setActivePop(null);
        } else {
            setShowDeleteIcons(true); 
            setShowCheckbox(false); 
            setActivePop(1); 
            popIn(); 
        }
    };

    const toggleCheckboxVisibility = () => {
        if (showCheckbox) {
            setShowCheckbox(false); 
            setActivePop(null); 
        } else {
            setShowCheckbox(true); 
            setShowDeleteIcons(false); 
            setActivePop(3); 
            popIn(); 
        }
    };

    const handlePlusNavigation = () => {
        popOut(); 
        setShowDeleteIcons(false); 
        setShowCheckbox(false); 
        navigation.navigate('FinancialLog');
    };
    
    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.rowProductTitle}>

                {/* Back Arrow */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                    <AntDesign name="arrowleft" size={28} color="white" />
                </TouchableOpacity>

                {/* Centered Text with Question Icon or Search Input */}
                {isSearchActive ? (
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor="#585858"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={true}
                    />
                ) : (
                    <View style={styles.textWithIcon}>
                        <Text style={styles.headerTextBottom}>View Financial Account</Text>
                        <TouchableOpacity onPress={() => setShowInfoMessage((prev) => !prev)}>
                            <AntDesign name="questioncircleo" size={14} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Search Icon */}
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => {
                        if (isSearchActive) {
                            handleSearch(); 
                        } else {
                            setIsSearchActive(true); 
                        }
                    }}
                >
                    <Feather name="search" size={28} color="white" />
                </TouchableOpacity>
            </View>

            {showInfoMessage && (
                <View style={styles.infoMessage}>
                    <Text style={styles.infoText}>
                        This Product Management Tool allows you to manage your products efficiently. You can add, edit, and delete products as needed.
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={handleOutsideClick}>
            <View style={{ flex: 1 }}>
                {renderHeader()}
                <View style={styles.container}>
                    <StatusBar hidden={false} />
                    {/* Loading Indicator */}
                    {isLoading ? (
                        <View style={styles.centeredContainer}>
                            <ActivityIndicator size="large" color="#4CAF50" />
                        </View>
                    ) : (
                        <>
                            {/* Search Results */}
                            {showNoData ? (
                                <View style={styles.centeredContainer}>
                                    <Text style={styles.noDataText}>
                                        Sorry, but you don't have any financial accounts that match your search criteria.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    {isSearchActive && results.map((result, index) => (
                                        <View key={index} style={styles.accountWrapper}>
                                            <TouchableOpacity style={styles.accountButton}>
                                                <Text style={styles.noDataText}>{result.account}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}                          
                                </>
                            )}
                        </>
                    )}

                    {/* Render accounts dynamically */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {!isSearchActive && !searchQuery ? ( 
                            accounts.length === 0 && !hasSearched && !showNoData && !isLoading ? (
                                <Text style={styles.noDataText}>No accounts available yet</Text>
                            ) : (
                                accounts.map((account, index) => (
                                    <View key={index} style={styles.accountWrapper}>
                                        {account && account.main_log_id && (
                                            <TouchableOpacity 
                                                style={styles.accountButton} 
                                                    onPress={() =>
                                                        navigation.navigate('ShowAccount', { selectedAccount: account.main_log_id })
                                                    }
                                            >
                                                <Text style={styles.placeholderText}>
                                                    {account.account}
                                                </Text>

                                                {showCheckbox && (
                                                    <>
                                                        {/* Checkbox to select an account */}
                                                        <TouchableOpacity 
                                                            style={styles.checkboxIcon} 
                                                            onPress={(event) => toggleAccountSelection(account, event)} 
                                                        >
                                                            <MaterialIcons
                                                                name={
                                                                    selectedAccounts.includes(account.account)
                                                                        ? 'check-box' 
                                                                        : 'check-box-outline-blank'
                                                                }
                                                                size={24}
                                                                color="black"
                                                            />
                                                        </TouchableOpacity>

                                                    </>
                                                )}

                                                {/* Delete icon */}
                                                {showDeleteIcons && (
                                                    <TouchableOpacity
                                                        style={styles.deleteIcon}
                                                        onPress={() => handleDeleteIconPress(account)}
                                                    >
                                                        <AntDesign name="delete" size={24} color="red" />
                                                    </TouchableOpacity>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))
                            )
                        ) : null}
                    </ScrollView>
                    
                    <Animated.View style={[styles.circlePop, {bottom: icon_1}]}>
                        <TouchableOpacity onPress={toggleDeleteIcons}>
                            <AntDesign name="delete" size={20} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={[styles.circlePop, {bottom: icon_2, right: icon_2}]}>
                        <TouchableOpacity onPress={handlePlusNavigation}>
                            <AntDesign name="plus" size={20} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={[styles.circlePop, {right: icon_3}]}>
                        <TouchableOpacity  onPress={toggleCheckboxVisibility}> 
                            <AntDesign name="select1" size={20} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                    <TouchableOpacity 
                        style={styles.circle} 
                        onPress={() => {
                            pop === false ? popIn() : popOut();
                        }}
                    >
                         <Animated.View style={{ transform: [{ rotate }] }}>
                            <AntDesign name="plus" size={24} color="white" />
                        </Animated.View>
                    </TouchableOpacity>

                </View>

                {/* Delete Financial Account Confirmation Modal */}
                <Modal visible={showDeleteConfirmationModal} transparent={true} animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Deleting this account could lead to deleting all your transactions. Are you sure you want to proceed?</Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.modalButton} onPress={confirmDelete}>
                                    <Text style={styles.modalButtonTextYes}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalButton} onPress={() => setShowDeleteConfirmationModal(false)}>
                                    <Text style={styles.modalButtonTextNo}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: width * 0.05,
        alignItems: 'stretch',
        paddingTop: height * 0.10, 
    },    
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.08,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        justifyContent: 'center',
        zIndex: 10,
    },
    rowProductTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    headerTextBottom: {
        fontSize: 14,
        fontFamily: 'bold',
        color: 'white',
        marginRight: 5,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'regular',
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        paddingHorizontal: 10,
        marginHorizontal: 10,
        color: '#000',
    },    
    infoMessage: {
        position: 'absolute',
        top: height * 0.06,
        left: width * 0.2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        width: width * 0.6,
        borderRadius: 5,
        padding: 10,
        elevation: 5,
        zIndex: 20,
    },
    infoText: {
        fontFamily: 'regular',
        fontSize: 10,
        color: '#333',
    },
    scrollContentContainer: {
        paddingBottom: 20,
        paddingHorizontal: width * 0.01, 
    },
    centeredContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1,
    },  
    accountWrapper: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
        padding: 5, 
    },    
    accountButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
    },
    deleteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    placeholderText: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'regular',
        flex: 1,
    },
    checkboxIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    editIcon: {
        position: 'absolute',
        top: 10,
        right: 50,  
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'regular',
        color: '#333',
    },
    resultText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'regular',
        color: '#333',
        marginVertical: 10,
    },
    circle: {
        backgroundColor: '#4CAF50',
        width: 50,
        height: 50, 
        position: 'absolute',
        bottom: 35,
        right: 35,
        borderRadius: 25, 
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    circlePop: {
        backgroundColor: '#4CAF50',
        width: 40,
        height: 40, 
        position: 'absolute',
        bottom: 40,
        right: 40,
        borderRadius: 25, 
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'medium',
    },
    modalMessage: {
        fontSize: 14,
        fontFamily: 'regular',
        color: '#666',
        marginVertical: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginTop: 10,
    },
    modalButtonTextYes: {
        fontSize: 14,
        color: '#4CAF50',
        fontFamily: 'medium',
    },
    modalButtonTextNo: {
        fontSize: 14,
        color: '#F44336',
        fontFamily: 'medium',
    },
});
