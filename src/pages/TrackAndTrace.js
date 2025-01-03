import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-chart-kit'; 
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '../hooks/useAuth'; 
import { supabase } from '../backend/supabaseClient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useQuery } from '@tanstack/react-query';
import { fetchBalances } from '../utils/api';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ProductScreen = ({ route }) => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("overall");
    const [showAllTags, setShowAllTags] = useState(false);
    const [showAllBalances, setShowAllBalances] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedBalances, setSelectedBalances] = useState([]);
    const subscriptionRef = useRef(null);

    useRealTimeUpdates(user?.id_user);

    useEffect(() => {
        if (user) {
            console.log('Check user:', user);
            loadData(); 
        }
    }, [user]);

    useFocusEffect(
        React.useCallback(() => {
            refetchBalances();
        }, [refetchBalances])
    );

    const { data: fetchedBalances = [], isLoading: loadingBalances, refetch: refetchBalances } = useQuery({
        queryKey: ['balances', user?.id_user],
        queryFn: () => fetchBalances(user.id_user),
        enabled: !!user, 
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (fetchedBalances.length > 0) {
            loadDataBalance(fetchedBalances); 
        }
    }, [fetchedBalances, selectedPeriod]);

    const loadDataBalance = (data) => {
        if (data && data.length > 0) {
            const today = new Date();
            const filteredData = data.filter(item => {
                const createdAt = new Date(item.created_at);
                switch (selectedPeriod) {
                    case 'overall':
                        return true;
                    case 'daily':
                        return createdAt.toDateString() === today.toDateString();
                    case 'monthly':
                        return createdAt.getMonth() === today.getMonth() && createdAt.getFullYear() === today.getFullYear();
                    case 'yearly':
                        return createdAt.getFullYear() === today.getFullYear();
                    default:
                        return false;
                }
            });
    
            const groupedBalances = filteredData.reduce((acc, item) => {
                const { overview_balance_id } = item;
                if (!acc[overview_balance_id]) {
                    acc[overview_balance_id] = {
                        overview_balance_id,
                        totalIncome: 0,
                        totalExpense: 0,
                        totalSaving: 0,
                        totalInvestment: 0,
                        balances: []
                    };
                }

                acc[overview_balance_id].balances.push(item);
 
                switch (item.type) {
                    case 'Income':
                        acc[overview_balance_id].totalIncome += item.amount;
                        break;
                    case 'Expense':
                        acc[overview_balance_id].totalExpense += item.amount;
                        break;
                    case 'Saving':
                        acc[overview_balance_id].totalSaving += item.amount;
                        break;
                    case 'Investment':
                        acc[overview_balance_id].totalInvestment += item.amount;
                        break;
                    default:
                        break;
                }
    
                return acc;
            }, {});
    
            const totals = Object.values(groupedBalances);
            setSelectedBalances(totals); 
        }
    };
    
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
    
            if (data && data.length > 0) {
                
                setSelectedTags(data);
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

    const handleDeleteBalance = async (balance) => {
        if (!balance || !balance.overview_balance_id) { 
            console.error('Invalid balance object:', balance);
            return; 
        }
    
        try {
            const { error } = await supabase
                .from('overviewbalance')
                .delete()
                .eq('overview_balance_id', balance.overview_balance_id); 
    
            if (error) {
                console.error('Error deleting balance:', error);
                return;
            }

            refetchBalances();
    
        } catch (err) {
            console.error('Unexpected error deleting balance:', err);
        }
    };

    const SwipeableBalanceItem = ({ balance, totalIncome, totalExpense, totalSaving, totalInvestment, totalBalance, handleDeleteBalance }) => {
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

        const hasNonZeroTotals = totalIncome > 0 || totalExpense > 0 || totalSaving > 0 || totalInvestment > 0;
    
        return (
            hasNonZeroTotals ? ( 
                <View style={styles.swipeableContainer}>
                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[styles.swipeableItem, animatedStyle]}>
                            <View style={styles.balanceItem}>
                                {totalIncome > 0 && (
                                    <View style={styles.balanceRowArrow}>
                                        <Text style={styles.productBalanceText}>
                                            {`Total Income: ${formatAmount(totalIncome)}`}
                                        </Text>
                                    </View>
                                )}
                                {totalExpense > 0 && (
                                    <View style={styles.balanceRow}>
                                        <Text style={styles.productBalanceText}>
                                            {`Total Expense: ${formatAmount(totalExpense)}`}
                                        </Text>
                                    </View>
                                )}
                                {totalSaving > 0 && (
                                    <View style={styles.balanceRow}>
                                        <Text style={styles.productBalanceText}>
                                            {`Total Saving: ${formatAmount(totalSaving)}`}
                                        </Text>
                                    </View>
                                )}
                                {totalInvestment > 0 && (
                                    <View style={styles.balanceRow}>
                                        <Text style={styles.productBalanceText}>
                                            {`Total Investment: ${formatAmount(totalInvestment)}`}
                                        </Text>
                                    </View>
                                )}
                                {totalBalance !== 0 && (
                                    <View style={styles.balanceRow}>
                                        <Text style={styles.productBalanceText}>
                                            {`Net Balance: ${formatAmount(totalBalance)}`}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Animated.View style={styles.deleteButton}>
                                <TouchableOpacity onPress={() => {
                                    console.log('Delete button pressed for balance:', balance);
                                    handleDeleteBalance(balance);
                                }}>
                                    <MaterialIcons name="delete" size={24} color="white" />
                                </TouchableOpacity>
                            </Animated.View>
                        </Animated.View>
                    </GestureDetector>
                </View>
            ) : null 
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
                                    {`${tag.description} - ${formatAmount(tag.amount)}`}
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
    
    const calculateTotals = (balances) => {
        let totalIncome = 0;
        let totalExpense = 0;
        let totalSaving = 0;
        let totalInvestment = 0;
    
        balances.forEach(group => {
            totalIncome += group.totalIncome;
            totalExpense += group.totalExpense;
            totalSaving += group.totalSaving;
            totalInvestment += group.totalInvestment;
        });
    
        const netBalance = totalIncome - totalExpense;
    
        return { totalIncome, totalExpense, totalSaving, totalInvestment, netBalance };
    };
    
    const updatePieChartData = (totalIncome, totalExpense, totalSaving, totalInvestment, netBalance) => {
        const total = totalIncome + totalExpense + totalSaving + totalInvestment;

        const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 0;
        const expensePercentage = total > 0 ? (totalExpense / total) * 100 : 0;
        const savingPercentage = total > 0 ? (totalSaving / total) * 100 : 0;
        const investmentPercentage = total > 0 ? (totalInvestment / total) * 100 : 0;
        const netBalancePercentage = total > 0 ? (netBalance / total) * 100 : 0;
    
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
                population: netBalancePercentage,
                color: 'orange',
                legendFontColor: 'black',
                legendFontSize: 12
            },
        ]);
    };
    
    useEffect(() => {
        const { totalIncome, totalExpense, totalSaving, totalInvestment, netBalance } = calculateTotals(selectedBalances);
        updatePieChartData(totalIncome, totalExpense, totalSaving, totalInvestment, netBalance);
    }, [selectedBalances]);
    
  return (
    <ScrollView style={styles.container} scrollEventThrottle={16} showsVerticalScrollIndicator={false} >
        <StatusBar hidden={false} />

        <View style={styles.header}>
            <View style={styles.headerTitle}>
                <Text style={styles.headerTitleText}>Hello, {user?.first_name.trim() || 'User'}!</Text>
            </View>
            <View style={styles.headerGreet}>
                <Text style={styles.headerTitleText}>Let's trace and track your finances.</Text>
            </View>
        </View>

       <View style={styles.statisticsContainer}>
                <View style={styles.rowStatistics}>
                    <Text style={styles.title}>Statistics</Text>
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
                
                <View style={styles.pieContainer}>
                    {pieData.length > 0 && pieData.some(item => item.population > 0) && (
                        <Text style={styles.textTotal}>Total Income</Text>
                    )}

                    {loadingBalances ? (
                        <ActivityIndicator size={35} color="#4CAF50" style={styles.loadingBalances} />
                    ) : (
                        <>
                            {pieData.length > 0 && pieData.some(item => item.population > 0) ? (
                                <>
                                    <Text style={styles.textAmount}>
                                        {`${formatAmount(calculateTotals(selectedBalances).netBalance)}`}
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
                                </>
                            ) : (
                                <Text style={styles.noDataText}>No data available for the selected period.</Text>
                            )}
                        </>
                    )}
                </View>
        </View>

        <View style={styles.overviewContainer}>
            <View style={styles.rowOverview}>
                <Text style={styles.titleOverview}>Overview Balance</Text>
            </View>

            <View style={styles.detailsOverviewContainer}>
                <Text style={styles.textDetails}>You can set up a quick snapshot of your finances.</Text>
            </View>

            <View style={styles.placeholderOverviewBalanceContainer}>
                {selectedBalances.length === 0 ? (
                    <Text style={styles.noDataText}>No balance created.</Text>
                ) : (
                    selectedBalances.slice(0, showAllBalances ? selectedBalances.length : 4).map((group) => (
                        <View key={group.overview_balance_id}>
                            <SwipeableBalanceItem 
                                balance={group.balances[0]} 
                                totalIncome={group.totalIncome}
                                totalExpense={group.totalExpense}
                                totalSaving={group.totalSaving}
                                totalInvestment={group.totalInvestment}
                                totalBalance={group.totalIncome - group.totalExpense} 
                                handleDeleteBalance={handleDeleteBalance}
                            />
                        </View>
                    ))
                )}

                {selectedBalances.length > 4 && !showAllBalances && (
                    <TouchableOpacity onPress={() => setShowAllBalances(true)} style={styles.showMoreButton}>
                        <Text style={styles.showMoreText}>Show More</Text>
                    </TouchableOpacity>
                )}

                {showAllBalances && (
                    <TouchableOpacity onPress={() => setShowAllBalances(false)} style={styles.showLessButton}>
                        <Text style={styles.showLessText}>Show Less</Text>
                    </TouchableOpacity>
                )}
            </View>   
        </View>

        <View style={styles.tagContainer}>
            <View style={styles.rowTag}>
                <Text style={styles.titleTag}>Tags for Monthly Budget</Text>
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
        </View>

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
        height: 'auto',
        position: 'relative',
    },
    textTotal: {
        position: 'absolute',
        top: 1,
        left: 10,
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
        margin: 20,
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
        fontSize: 14,
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
