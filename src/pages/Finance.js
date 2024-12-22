import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { PieChart } from 'react-native-chart-kit'; 
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../hooks/useAuth'; 
import { supabase } from '../backend/supabaseClient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ProductScreen = ({ route }) => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("overall");
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [showAllTags, setShowAllTags] = useState(false);
    const [showAllLogs, setShowAllLogs] = useState(false);
    const [showAllBalances, setShowAllBalances] = useState(false);
    const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
    const [selectedAccounts, setSelectedAccounts] = useState(route.params?.selectedAccounts || []);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedBalances, setSelectedBalances] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalSaving, setTotalSaving] = useState(0);
    const [totalInvestment, setTotalInvestment] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        if (user) {
            console.log('Current user navigating to Trace and Track:', user);
            loadDataBalance(); 
            loadData(); 
        }
    }, [user]);

    useEffect(() => {
        loadDataBalance(); 
    }, [selectedPeriod]);

    const loadDataBalance = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('overviewbalance')
                .select('overview_balance_id, description, amount, type, created_at')
                .eq('id_user', user.id_user); 
    
            if (error) {
                console.error('Error fetching balances:', error);
                return;
            }
    
            console.log('Raw fetched balances data:', data);
    
            if (data && data.length > 0) {
                const today = new Date();
                const filteredData = data.filter(item => {
                    const createdAt = new Date(item.created_at);
                    if (selectedPeriod === 'overall') {
                        return true; 
                    } else if (selectedPeriod === 'daily') {
                        return createdAt.toDateString() === today.toDateString();
                    } else if (selectedPeriod === 'monthly') {
                        return createdAt.getMonth() === today.getMonth() && createdAt.getFullYear() === today.getFullYear();
                    } else if (selectedPeriod === 'yearly') {
                        return createdAt.getFullYear() === today.getFullYear();
                    }
                    return false;
                });

                setSelectedBalances(filteredData);
    
                const totalIncome = filteredData
                    .filter(item => item.type === 'Income') 
                    .reduce((acc, item) => acc + item.amount, 0);
    
                const totalExpense = filteredData
                    .filter(item => item.type === 'Expense') 
                    .reduce((acc, item) => acc + item.amount, 0);
    
                const totalSaving = filteredData
                    .filter(item => item.type === 'Saving') 
                    .reduce((acc, item) => acc + item.amount, 0); 
    
                const totalInvestment = filteredData
                    .filter(item => item.type === 'Investment') 
                    .reduce((acc, item) => acc + item.amount, 0);
    
                const totalBalance = totalIncome - totalExpense; 
    
                setTotalIncome(totalIncome);
                setTotalExpense(totalExpense);
                setTotalSaving(totalSaving);
                setTotalInvestment(totalInvestment);
                setTotalBalance(totalBalance);

                updatePieChartData(totalIncome, totalExpense, totalSaving, totalInvestment);
            } else {
                console.log('No balances found in the database.');
            }
        } catch (err) {
            console.error('Unexpected error loading data:', err);
        }
    };

    const listenForBalancesChanges = async () => {
        if (subscriptionRef.current) return;
        try {
            const subscription = supabase
                .channel('database_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'overviewbalance' }, async (payload) => {
                    console.log('Database change detected:', payload);
                    await loadDataBalance();  
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('Successfully subscribed to tags changes.');
                    }
                });
            return subscription;
        } catch (err) {
            console.error('Error subscribing to database changes:', err);
        }
    };

    useEffect(() => {
        loadDataBalance().then(() => {
            listenForBalancesChanges();
        });
    
        return () => {
            if (subscriptionRef.current) {
                supabase.removeSubscription(subscriptionRef.current);
                subscriptionRef.current = null;
            }
        };
    }, []);

    const loadData = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('tags')
                .select('main_tag_id, description, amount')
                .eq('id_user', user.id_user); 
    
            if (error) {
                console.error('Error fetching tags:', error);
                return;
            }

            console.log('Raw fetched tags data:', data);
    
            if (data && data.length > 0) {
                
                setSelectedTags(data);
            } else {
                console.log('No tags found in the database.');
            }
        } catch (err) {
            console.error('Unexpected error loading data:', err);
        }
    };
    
    const listenForChanges = async () => {
        if (subscriptionRef.current) return;
        try {
            const subscription = supabase
                .channel('database_changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, async (payload) => {
                    console.log('Database change detected:', payload);
                    await loadData();  
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('Successfully subscribed to tags changes.');
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

    const formatAmount = (amount) => {
        return `₱ ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    const SwipeableBalanceItem = ({ balance, totalIncome, totalExpense, totalSaving, totalInvestment, totalBalance, handleDeleteTag }) => {
        const translateX = useSharedValue(0);
        const SWIPE_THRESHOLD = 50;
        const MAX_SWIPE = 150;
    
        const panGesture = Gesture.Pan()
            .onUpdate((event) => {
                translateX.value = Math.min(Math.max(0, event.translationX), MAX_SWIPE);
            })
            .onEnd(() => {
                if (translateX.value > SWIPE_THRESHOLD) {
                    translateX.value = withSpring(MAX_SWIPE);
                } else {
                    translateX.value = withSpring(0);
                }
            });
    
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: -translateX.value }],
        }));
    
        return (
            <View style={styles.swipeableContainer}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.swipeableItem, animatedStyle]}>
                        <View style={styles.balanceItem}>
                            <TouchableOpacity 
                                onPress={() => handleArrowClick(accountName)} 
                                style={styles.arrowButton} 
                            >
                                <MaterialIcons name="arrow-forward-ios" size={24} color="white" />
                            </TouchableOpacity>
                            <View style={styles.balanceRowArrow}>
                                {totalIncome > 0 && (
                                    <Text style={styles.productBalanceText}>
                                        {`Total Income: ${formatAmount(totalIncome)}`}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.balanceRow}>
                                {totalExpense > 0 && (
                                    <Text style={styles.productBalanceText}>
                                        {`Total Expense: ${formatAmount(totalExpense)}`}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.balanceRow}>
                                {totalSaving > 0 && (
                                    <Text style={styles.productBalanceText}>
                                        {`Total Saving: ${formatAmount(totalSaving)}`}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.balanceRow}>
                                {totalInvestment > 0 && (
                                    <Text style={styles.productBalanceText}>
                                        {`Total Investment: ${formatAmount(totalInvestment)}`}
                                    </Text>
                                )}
                            </View>
                            {totalIncome > 0 || totalExpense > 0 || totalSaving > 0 || totalInvestment > 0 ? (
                                <View style={styles.balanceRow}>
                                    <Text style={styles.productBalanceText}>
                                        {`Net Balance: ${formatAmount(totalBalance)}`}
                                    </Text>
                                </View>
                            ) : null}
                            
                        </View>
                        <Animated.View style={styles.deleteButton}>
                            <TouchableOpacity onPress={() => handleDeleteTag(balance.description)}>
                                <MaterialIcons name="delete" size={24} color="white" />
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </GestureDetector>
            </View>
        );
    };

    const SwipeableTagItem = ({ tag, handleDeleteTag }) => {
        const translateX = useSharedValue(0);
        const SWIPE_THRESHOLD = 50;
        const MAX_SWIPE = 150;
    
        const panGesture = Gesture.Pan()
            .onUpdate((event) => {
                translateX.value = Math.min(Math.max(0, event.translationX), MAX_SWIPE);
            })
            .onEnd(() => {
                if (translateX.value > SWIPE_THRESHOLD) {
                    translateX.value = withSpring(MAX_SWIPE);
                } else {
                    translateX.value = withSpring(0);
                }
            });
    
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: -translateX.value }],
        }));
    
        return (
            <View style={styles.swipeableContainer}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.swipeableItem, animatedStyle]}>
                        <View style={styles.accountItem}>
                            <View style={styles.accountRow}>
                                <Text style={styles.productTagText}>
                                    {tag.description} - ₱{tag.amount.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <Animated.View style={styles.deleteTagButton}>
                            <TouchableOpacity onPress={() => handleDeleteTag(tag.description)}>
                                <MaterialIcons name="delete" size={24} color="white" />
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </GestureDetector>
            </View>
        );
    };

    const handleDeleteTag = async (tagDescription) => {
        if (!tagDescription) return;
    
        try {
            const { error } = await supabase
                .from('tags')
                .delete()
                .eq('description', tagDescription); 
    
            if (error) {
                console.error('Error deleting tag:', error);
                return;
            }
    
            setSelectedTags((prevTags) => prevTags.filter(tag => tag.description !== tagDescription));

        } catch (err) {
            console.error('Unexpected error deleting tag:', err);
        }
    };

    
    const SwipeableItem = ({ accountName }) => {
        const translateX = useSharedValue(0);
        const SWIPE_THRESHOLD = 50;
        const MAX_SWIPE = 150;
    
        const panGesture = Gesture.Pan()
            .onUpdate((event) => {
                translateX.value = Math.min(Math.max(0, event.translationX), MAX_SWIPE);
            })
            .onEnd(() => {
                if (translateX.value > SWIPE_THRESHOLD) {
                    translateX.value = withSpring(MAX_SWIPE);
                } else {
                    translateX.value = withSpring(0);
                }
            });
    
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: -translateX.value }],
        }));
    
        return (
            <View style={styles.swipeableContainer}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.swipeableItem, animatedStyle]}>
                        {/* Schedule Item */}
                        <View style={styles.accountItem}>
                            <View style={styles.accountRow}>
                                <Text style={styles.productAccountText}>
                                    {accountName}
                                </Text>
    
                                <TouchableOpacity onPress={() => handleArrowClick(accountName)}>
                                    <MaterialIcons name="arrow-forward-ios" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
    
                        </View>
    
                        {/* Delete Button (appears after swipe) */}
                        <Animated.View style={styles.deleteButton}>
                            <TouchableOpacity onPress={() => confirmDelete(accountName)}>
                                <MaterialIcons name="delete" size={24} color="white" />
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </GestureDetector>
            </View>
        );
    };
    

    const handleDelete = async () => {
        if (!accountToDelete) return;

        try {
            const { error } = await supabase
                .from('financiallogs')
                .delete()
                .eq('account', accountToDelete); 
            if (error) {
                console.error('Error deleting account records:', error);
                return;
            }

            setSelectedAccounts((prevAccounts) => prevAccounts.filter(account => account !== accountToDelete));
            setShowDeleteConfirmationModal(false);
            setAccountToDelete(null);
        } catch (err) {
            console.error('Unexpected error deleting account records:', err);
        }
    };

    const handleArrowClick = (accountName) => {
        navigation.navigate('ShowAccount', { selectedAccount: accountName });
    };

    const loadSelectedAccounts = async () => {
        try {
            const storedAccounts = await AsyncStorage.getItem('selectedAccounts');
            if (storedAccounts) {
                const accounts = JSON.parse(storedAccounts);
                console.log('Loaded Accounts:', accounts);
                setSelectedAccounts(accounts);
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

    useEffect(() => {
        saveSelectedAccounts(selectedAccounts); 
    }, [selectedAccounts]);

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

    const confirmDelete = (accountName) => {
        setAccountToDelete(accountName);
        setShowDeleteConfirmationModal(true);
    };  

    const [pieData, setPieData] = useState([
        {
            name: 'Total Expenses',
            population: 0,
            color: 'red',
            legendFontColor: 'black',
            legendFontSize: 11
        },
        {
            name: 'Savings',
            population: 0,
            color: 'blue',
            legendFontColor: 'black',
            legendFontSize: 12
        },
        {
            name: 'Investments',
            population: 0,
            color: 'yellow',
            legendFontColor: 'black',
            legendFontSize: 12
        },
        {
            name: 'Net Balance',
            population: 0,
            color: 'green',
            legendFontColor: 'black',
            legendFontSize: 12
        },
    ]);

    const updatePieChartData = (totalIncome, totalExpense, totalSaving, totalInvestment) => {
        const netBalance = totalIncome - totalExpense;
 
        const total = totalIncome + totalExpense + totalSaving + totalInvestment;

        const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 0;
        const expensePercentage = total > 0 ? (totalExpense / total) * 100 : 0;
        const savingPercentage = total > 0 ? (totalSaving / total) * 100 : 0;
        const investmentPercentage = total > 0 ? (totalInvestment / total) * 100 : 0;
    
        setPieData([
            {
                name: 'Total Income',
                population: incomePercentage,
                color: 'green',
                legendFontColor: 'black',
                legendFontSize: 12
            },
            {
                name: 'Total Expenses',
                population: expensePercentage,
                color: 'red',
                legendFontColor: 'black',
                legendFontSize: 12
            },
            {
                name: 'Savings',
                population: savingPercentage,
                color: 'blue',
                legendFontColor: 'black',
                legendFontSize: 12
            },
            {
                name: 'Investments',
                population: investmentPercentage,
                color: 'yellow',
                legendFontColor: 'black',
                legendFontSize: 12
            },
            {
                name: 'Net Balance',
                population: total > 0 ? (netBalance / total) * 100 : 0,
                color: 'orange',
                legendFontColor: 'black',
                legendFontSize: 12
            },
        ]);
    };
    
  return (
    <ScrollView style={styles.container} scrollEventThrottle={16} showsVerticalScrollIndicator={false} >
        <StatusBar hidden={false} />

        {/* Header */}
        <View style={styles.header}>
            <View style={styles.headerTitle}>
                <Text style={styles.headerTitleText}>Hello, {user?.first_name.trim() || 'User'}!</Text>
            </View>
            <View style={styles.headerGreet}>
                <Text style={styles.headerTitleText}>Let's trace and track your finances.</Text>
            </View>
        </View>

       {/* Statistics Container */}
       <View style={styles.statisticsContainer}>
            <View style={styles.rowStatistics}>
                <Text style={styles.title}>Statistics</Text>
                <TouchableOpacity onPress={() => setShowInfoMessage((prev) => !prev)}>
                    <AntDesign name="questioncircleo" size={14} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.rowDetailsPicker}>
                <View style={styles.detailsContainer}>
                    <Text style={styles.textDetails}>You can view your overall finances here.</Text>
                </View>
                <View style={styles.wrapperPicker}>
                    <RNPickerSelect
                        onValueChange={(value) => setSelectedPeriod(value)}
                        items={[
                            { label: 'Overall', value: 'overall' },
                            { label: 'Daily', value: 'daily' },
                            { label: 'Monthly', value: 'monthly' },
                            { label: 'Yearly', value: 'yearly' }
                        ]}
                        value={selectedPeriod}
                        placeholder={{ label: "Select period", value: null }}
                        style={styles.picker}
                    />
                </View>
            </View>

            {/* Pie Chart Section */}
            <View style={styles.pieContainer}>
                <Text style={styles.textTotal}>Total Income</Text>
                <Text style={styles.textAmount}>
                    {totalBalance > 0 ? formatAmount(totalBalance) : "---------" }
                </Text>
                
                <PieChart
                    data={pieData}
                    width={width - 45}  
                    height={220}  
                    chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: '#fb8c00',
                        backgroundGradientTo: '#ffa726',
                        decimalPlaces: 0, 
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="10" 
                    chartLabel={(value) => `${value.toFixed(2)}%`}
                />
            </View>

        </View>

        <View style={styles.overviewContainer}>
            <View style={styles.rowOverview}>
                <Text style={styles.titleOverview}>Overview Balance</Text>
                <TouchableOpacity onPress={() => setShowInfoMessage((prev) => !prev)}>
                    <AntDesign name="questioncircleo" size={14} color="black"/>
                </TouchableOpacity>
            </View>

            <View style={styles.detailsOverviewContainer}>
                <Text style={styles.textDetails}>You can set up a quick snapshot of your finances.</Text>
            </View>

            <View style={styles.placeholderOverviewBalanceContainer}>
                {selectedBalances.length === 0 ? (
                    <Text style={styles.noDataText}>No balance created.</Text>
                ) : (
                    <SwipeableBalanceItem 
                        totalIncome={totalIncome} 
                        totalExpense={totalExpense} 
                        totalSaving={totalSaving} 
                        totalInvestment={totalInvestment} 
                        totalBalance={totalBalance} 
                    />
                )}
            </View>
            
        </View>

        <View style={styles.tagContainer}>
            <View style={styles.rowTag}>
                <Text style={styles.titleTag}>Tags for Monthly Budget</Text>
                <TouchableOpacity onPress={() => setShowInfoMessage((prev) => !prev)}>
                    <AntDesign name="questioncircleo" size={14} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.detailsTagContainer}>
                <Text style={styles.textTagDetails}>You can use tags to categories and track your monthly budget efficiently.</Text>
            </View>

            <View style={styles.placeholderTagContainer}>
                {selectedTags.length === 0 ? (
                    <Text style={styles.noDataText}>No tags created.</Text>
                ) : (
                    selectedTags.slice(0, showAllTags ? selectedTags.length : 4).map((tag, index) => (
                        <SwipeableTagItem key={index} tag={tag} handleDeleteTag={handleDeleteTag} />
                    ))
                )}
            </View>

            {selectedTags.length > 4 && !showAllTags && (
                <TouchableOpacity onPress={() => setShowAllTags(true)} style={styles.showMoreButton}>
                    <Text style={styles.showMoreText}>show more</Text>
                </TouchableOpacity>
            )}

            {showAllTags && (
                <TouchableOpacity onPress={() => setShowAllTags(false)} style={styles.showLessButton}>
                    <Text style={styles.showLessText}>show less</Text>
                </TouchableOpacity>
            )}
            
        </View>

        <View style={styles.financeContainer}>
            <View style={styles.rowFinance}>
                <Text style={styles.title}>Finance Log</Text>
                <TouchableOpacity onPress={() => setShowInfoMessage((prev) => !prev)}>
                    <AntDesign name="questioncircleo" size={14} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.detailsFinanceContainer}>
                <Text style={styles.textFinanceDetails}>You can create to get a detailed record of all your transactions.</Text>
            </View>

            <View style={styles.placeholderLogContainer}>
                {selectedAccounts.length === 0 ? (
                    <Text style={styles.noDataText}>No accounts selected.</Text>
                ) : (
                    selectedAccounts.slice(0, showAllLogs ? selectedAccounts.length : 4).map((account, index) => (
                        <SwipeableItem key={index} accountName={account} handleDelete={handleDelete} />
                    ))
                )}
            </View>

            {selectedAccounts.length > 4 && !showAllLogs && (
                <TouchableOpacity onPress={() => setShowAllLogs(true)} style={styles.showMoreButton}>
                    <Text style={styles.showMoreText}>show more</Text>
                </TouchableOpacity>
            )}

            {showAllLogs && (
                <TouchableOpacity onPress={() => setShowAllLogs(false)} style={styles.showLessButton}>
                    <Text style={styles.showLessText}>show less</Text>
                </TouchableOpacity>
            )}
        </View>


        <View style={styles.lineContainer}>
            <View style={[styles.grandline,{ flex: 1 } ]}/>
        </View>

        <View style={styles.createContainer}>
            <Text style={styles.createTitle}>Start monitoring your finances</Text>

            <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('OverviewBalance')}>
                <Text style={styles.createText}>Create overview balance</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('Tag')}>
                <Text style={styles.createText}>Create tags</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('FinancialLog')}>
                <Text style={styles.createText}>Create finance log</Text>
            </TouchableOpacity>
        </View>

        <Modal visible={showDeleteConfirmationModal} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Deleting this account could lead to deleting all your entries. Are you sure you want to proceed?</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
                            <Text style={styles.modalButtonTextYes}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={() => setShowDeleteConfirmationModal(false)}>
                            <Text style={styles.modalButtonTextNo}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
    statisticsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    overviewContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 20,
    },
    titleOverview: {
        fontSize: 15,
        fontFamily: 'medium',
    },
    rowOverview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    detailsOverviewContainer: {
        justifyContent: 'center',
    },
    tagContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    detailsTagContainer: {
        justifyContent: 'center',
    },
    rowTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    textTagDetails: {
        fontSize: 9,
        color: '#666',
        fontFamily: 'regular',
    },
    titleTag: {
        fontSize: 14,
        fontFamily: 'medium',
    },
    financeContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 20,
    },
    detailsFinanceContainer: {
        justifyContent: 'center',
    },
    rowFinance: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    textFinanceDetails: {
        fontSize: 11,
        color: '#666',
        fontFamily: 'regular',
    },
    rowStatistics: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',  
        gap: 5, 
    },
    title: {
        fontSize: 15,
        fontFamily: 'medium',
    },
    rowDetailsPicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -10,
    },
    picker: {
    },
    picker: {
        inputIOS: {
            fontSize: 14,
            paddingVertical: 8,
            paddingHorizontal: 10,
            color: 'white', 
            textAlign: 'center',
            height: 40,
        },
        inputAndroid: {
            fontSize: 14,
            paddingHorizontal: 10,
            paddingVertical: 8,
            color: 'white', 
            textAlign: 'center',
        },
        placeholder: {
            color: 'white', 
        },
    },
    detailsContainer: {
        justifyContent: 'center', 
        alignItems: 'center',    
    },
    wrapperPicker: {
        width: '36%',
        backgroundColor: '#4CAF50', 
        borderRadius: 4,
        height: 30,
        justifyContent: 'center', 
    },
    textDetails: {
        fontSize: 11,
        color: '#666',
        fontFamily: 'regular',
    },
    pieContainer: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        justifyContent: 'center',
        height: 280,
    },
    textTotal: {
        marginTop: 10,
        fontSize: 12,
        fontFamily: 'regular',
    },
    textAmount: {
        fontSize: 24,
        fontFamily: 'bold',
    },
    createContainer: {
        alignItems: 'center',
        padding: 10,
        paddingHorizontal: 30,
    },
    createTitle: {
        fontSize: 14,
        fontFamily: 'regular',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        marginBottom: 20,
        width: '100%',
        borderRadius: 20,
        alignItems: 'center',
    },
    createText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'regular',
    },
    lineContainer: {
        paddingHorizontal: 20,      
        alignItems: 'flex-start',  
    },  
    line: {
        marginTop: 20,
        borderBottomWidth: 8,
        borderColor: '#4CAF50',  
        borderRadius: 5,
        width: '100%',
        marginVertical: 10,
    },
    tagline: {
        borderBottomWidth: 8,
        borderColor: '#4CAF50',  
        borderRadius: 5,
        width: '100%',
        marginVertical: 10,
    },
    grandline: {
        marginTop: 50,
        borderBottomWidth: 8,
        borderColor: '#4CAF50',  
        borderRadius: 5,
        width: '100%',
        marginVertical: 10,
    },
    placeholderLogContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderTagContainer: {
        
    },
    showMoreButton: {
        alignItems: 'center',
    },
    showMoreText: {
        fontFamily: 'regular',
        fontSize: 12,
        color: 'blue', 
    },
    showLessButton: {
        alignItems: 'center',
    },
    showLessText: {
        fontFamily: 'regular',
        fontSize: 12,
        color: 'blue',
    },
    noDataText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'regular',
        color: '#333',
    },
    swipeableContainer: {
        marginBottom: 10,
        overflow: 'hidden', 
    },
    swipeableItem: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    accountItem: {
        backgroundColor: '#4CAF50', 
        padding: 10,
        borderRadius: 10,
        flex: 1,
    },
    balanceItem: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#4CAF50', 
        padding: 10,
        borderRadius: 10,
    },
    arrowButton: {
        position: 'absolute',
        left: 290, 
        right: 0,
        top: 10, 
    },
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    balanceRow: {
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 5,
    },
    balanceRowArrow: {
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    productAccountText: {
        fontSize: 16,
        color: 'white',
        fontFamily: 'medium',
    },
    productTagText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'medium',
    },
    productBalanceText: {
        fontSize: 12,
        color: 'white',
        fontFamily: 'medium',
    },
    deleteTagButton: {
        position: 'absolute',
        top: 0,
        right: -60, 
        width: 60,
        height: '100%',
        backgroundColor: '#D32F2F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        zIndex: 2,
    },
    deleteButton: {
        position: 'absolute',
        top: 0,
        right: -60, 
        width: 60,
        height: '100%',
        backgroundColor: '#D32F2F',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        zIndex: 2,
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

export default ProductScreen;
