import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, TextInput, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { BackHandler } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import CustomAlert from '../support/CustomAlert';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../backend/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

export default function Tag({ navigation }) {
    const { user } = useAuth(); 
    const userId = user?.id_user; 
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('');
    const [descriptionFocused, setDescriptionFocused] = useState(false);
    const [amountFocused, setAmountFocused] = useState(false);
    const [typeFocused, setTypeFocused] = useState(false);
    const [showInfoMessage, setShowInfoMessage] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const [balanceDeleteConfirmationVisible, setBalanceDeleteConfirmationVisible] = useState(false);
    const [balanceConfirmationVisible, setBalanceConfirmationVisible] = useState(false);
    const [tag, setTag] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };
    
    
    useEffect(() => {
      const backAction = () => {
        navigation.navigate('TraceAndTrack'); 
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

    const handleAddTag = async () => {
        const trimmedDescription = description.trim();
        const parsedAmount = parseFloat(amount.trim());

        if (!trimmedDescription || isNaN(parsedAmount)) {
            setIsAlertVisible(true);
            return; 
        }

        const newTag = {
            description: trimmedDescription,
            amount: parsedAmount,
        };

        setTag((prev) => [...prev, newTag]);


        setAmount('');
        setDescription('');
        setAmountFocused(false);
        setDescriptionFocused(false);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTextTop}>Welcome to</Text>
            <View style={styles.headerRow}>
                <View style={styles.rowProductTitle}>
                    <Text style={styles.headerTextBottom}>Farmer Management Tool</Text>
                    <TouchableOpacity style={styles.questionInfo} onPress={() => setShowInfoMessage((prev) => !prev)}>
                        <AntDesign 
                        name="questioncircleo" 
                        size={12} 
                        color="white" 
                        style={styles.iconSpacing} 
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {showInfoMessage && (
                <View style={styles.infoMessage}>
                    <Text style={styles.infoText}>
                        This Farmer Management Tool allows you to manage your products efficiently. You can add, edit, and delete as needed.
                    </Text>
                </View>
            )}
        </View>
    ); 
    
    const handleConfirm = () => {
      setIsConfirmationModalVisible(false);
      setIsLoading(true);
    
      setTimeout(() => {
        setIsLoading(false);

        const updatedBalance = {
          amount: amount,
          description: description,
          type: type,
        };

        navigation.navigate('TraceAndTrace');
      }, 3000);
    };
    
    const handleCancel = () => {
        setIsConfirmationModalVisible(false); 
    };

    const handleDone = async () => {

        if (tag.length === 0) {
            setIsAlertVisible(true);
            return;
        }
    
        try {
            setIsLoading(true);
      
            const mainIdTag = uuidv4();
      
            const tagData = tag.map(t => ({
              id_user: userId,
              main_tag_id: mainIdTag,
              description: t.description,
              amount: t.amount,
            }));
      
            const { data, error } = await supabase
              .from('tags')
              .insert(tagData);
      
            if (error) {
                console.error('Failed to save tags', error.message);
                showAlert('Error', 'An error occurred while saving your tags.');
                return;
            }

            showAlert('Success', 'Tags added successfully');

            navigation.navigate('TraceAndTrack');

          } catch (err) {
            console.error('Unexpected error in handleDone:', err.message);
            showAlert('Error', 'An unexpected error occurred while saving the tags.');
          } finally {
            setIsLoading(false);
          }
    };    
  
    const renderAlertMessage = () => {
        if (amount.trim() === '') {
          return 'Your Amount is empty.';
        } else if (description.trim() === '') {
          return 'Your description is empty.';
        } else if (type.trim() === '') {
          return 'Your type is empty.';
        } else {
          return 'Your amount, description, type are empty';
        }
    };   

    const handleDeleteBalance = () => {
        setBalanceDeleteConfirmationVisible(true);
    };

    const confirmDeleteBalance = () => {
        setBalanceDeleteConfirmationVisible(false);
        setAmount('');
        setDescription('');
        setType('');
        setAmountFocused(false);
        setDescriptionFocused(false);
        setTypeFocused(false);
    };

    const handleAddNewBalance = () => {
        setBalanceConfirmationVisible(true);
    };

    const confirmAddNewBalance = () => {
        setBalanceConfirmationVisible(false);
        setAmount('');
        setDescription('');
        setType('');
        setAmountFocused(false);
        setDescriptionFocused(false);
        setTypeFocused(false);
    };

    const formatAmount = (amount) => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) return "₱0.00"; 
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(parsedAmount);
    };

    <CustomAlert 
        visible={alertVisible} 
        title={alertTitle} 
        message={alertMessage} 
        onClose={() => setAlertVisible(false)} 
    />

    return (
        <>
            {renderHeader()}
            <ScrollView style={styles.container}>
                <StatusBar hidden={false} />

                <View style={styles.balanceContainer}>
                    <View style={styles.wrapperButtons}>
                        <Text style={styles.sectionTitle}>Create Tag</Text>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteBalance}>
                            <View style={styles.iconTextRow}>
                                <AntDesign name="delete" size={20} color="black" />
                                <Text style={styles.buttonText}>Delete Tag</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.placeholderBalanceContainer}>
                    <View style={styles.placeholderBalance}>
                        {tag.length > 0 ? (
                            tag.map((balance, index) => (
                                <View key={index} style={styles.balanceWrapper}>
                                    <View style={styles.balanceRow}>
                                        <Text style={styles.balanceText}>
                                            {`${balance.description} -  ${formatAmount(balance.amount)}`}
                                        </Text>
                                    </View>
                                    {index < tag.length - 1 && <View style={styles.separatorLine} />}
                                </View> 
                            ))
                        ) : (
                            <Text style={styles.noBalanceText}>No Tag Yet</Text>
                        )}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitlesDescription}>Description</Text>
                    <View style={[styles.inputWrapper, descriptionFocused && description.length === 0 && styles.errorBorder]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Add Description"
                            value={description}
                            onChangeText={setDescription}
                            onBlur={() => setDescriptionFocused(true)}
                        />
                    </View>
                    <Text style={styles.inputTitlesAmount}>Amount</Text>
                    <View style={[styles.inputWrapper, amountFocused && amount.length === 0 && styles.errorBorder]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Add Amount"
                            value={amount}
                            keyboardType="numeric"
                            onChangeText={setAmount}
                            onBlur={() => setAmountFocused(true)}
                        />
                    </View>

                    <View style={styles.tagWrapper}>
                        <TouchableOpacity style={styles.tagButton} onPress={handleAddTag}>
                            <Text style={styles.tagText}>Add Tag</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footerButtons}>
                    <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                        <Text style={styles.doneText}>Done</Text>
                        <Feather name="arrow-right" size={30} color="#28B805" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={isConfirmationModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you sure you want to create this tag?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
                                <Text style={styles.modalButtonTextYes}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
                                <Text style={styles.modalButtonTextNo}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <CustomAlert
                visible={isAlertVisible}
                title={'Empty'}
                message={renderAlertMessage()}
                onClose={() => setIsAlertVisible(false)}
            />

            <Modal visible={isLoading} transparent ={true} animationType="fade">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ padding: 20, borderRadius: 10, alignItems: 'center' }}>
                        <ActivityIndicator size={50} color="#4CAF50" />
                        <Text style={{ marginTop: 10, fontFamily: 'medium', color: 'white' }}>Uploading your tag...</Text>
                    </View>
                </View>
            </Modal>

            <Modal visible={balanceConfirmationVisible} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you sure you want to add a tag?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={confirmAddNewBalance}>
                                <Text style={styles.modalButtonTextYes}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setBalanceConfirmationVisible(false)}>
                                <Text style={styles.modalButtonTextNo}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={balanceDeleteConfirmationVisible} transparent={true} animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you sure you want to delete all tags?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={confirmDeleteBalance}>
                                <Text style={styles.modalButtonTextYes}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setBalanceDeleteConfirmationVisible(false)}>
                                <Text style={styles.modalButtonTextNo}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: width * 0.05,
    },
    header: {
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: height * 0.08,
        backgroundColor: '#4CAF50', 
        padding: width * 0.02,
        zIndex: 10, 
    },
    headerTextTop: {
        fontSize: width > 400 ? 16 : 12,
        fontFamily: 'bold',
        color: 'white',
        paddingHorizontal: 10, 
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10, 
    },  
    rowProductTitle: {
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        flexWrap: 'wrap',
    },
    iconSpacing: {
        padding: 5,
    },
    headerTextBottom: {
        fontSize: 12,
        fontFamily: 'bold',
        color: 'white',
    },
    infoMessage: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        textAlign: 'center',
        width: '90%',
        height: height * 0.01,
        borderRadius: 5,
        padding: 10,
        marginBottom: 1,
        elevation: 3, 
        zIndex: 10, 
    },
    infoText: {
        fontFamily: 'regular',
        fontSize: 12,
        color: '#333',
    },
    balanceContainer: {
        marginTop: 50,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'bold',
        color: 'black',
    },
    wrapperButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addButton: {
        paddingVertical: 10,
        borderRadius: 5,
    },
    deleteButton: {
        paddingVertical: 10,
        borderRadius: 5,
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        marginLeft: 5,
        fontSize: 12,
        fontFamily: 'medium',
    },
    placeholderBalanceContainer: {
        justifyContent: 'center',
    },
    placeholderBalance: {
        borderWidth: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        width: '100%',
        marginBottom: 5,
        height: 'auto',
        minHeight: 150, 
    },
    inputContainer: {
        marginTop: 20,
    },
    separatorLine: {
        height: 1,
        backgroundColor: 'black',
    },
    balanceWrapper: {
        width: '100%',
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 5,
    },
    balanceText: {
        fontSize: 15,
        fontFamily: 'regular',
    },
    noBalanceText: {
        fontSize: 14,
        fontFamily: 'regular'
    },
    inputTitlesAmount: {
        fontSize: 14,
        fontFamily: 'regular',
    },
    inputTitlesDescription: {
        fontSize: 14,
        fontFamily: 'regular',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(27, 164, 15, 0.31)',
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    input: {
        color: 'black',
        fontSize: 13,
        fontFamily: 'medium',
        marginHorizontal: 5,
        padding: 10,
        flex: 1, 
    },
    errorBorder: {
        borderWidth: 1,
        borderColor: '#F44336',
    },
    tagWrapper: {
        marginTop: 10,
    },
    tagButton: {
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        padding: 10,
    },
    tagText: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'medium',
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end', 
        alignItems: 'center',
        marginTop: 60,
    },
    doneButton: {
        flexDirection: 'row',
        padding: 5,
    },
    doneText: {
        padding: 5,
        fontSize: 14,
        color: "#28B805",  
        fontFamily: 'bold',
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
