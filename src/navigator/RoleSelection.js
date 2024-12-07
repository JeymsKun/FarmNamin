import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native';

export default function RoleScreen({ navigation }) {

    const handleRoleSelection = (role) => {
        navigation.navigate('Login', { role });
    };

    return (
        <View style={styles.container}>
            <View style={styles.rowWrapper}>
                <View style={styles.farmerContainer}>
                    <TouchableOpacity style={styles.farmerButton} onPress={() => handleRoleSelection('farmer')}>
                        <Image source={require('../assets/farmer.png')} style={styles.image} />
                        <Text style={styles.text}>Yes, I am.</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.consumerContainer}>
                    <TouchableOpacity style={styles.consumerButton} onPress={() => handleRoleSelection('consumer')}>
                        <Image source={require('../assets/consumer.png')} style={styles.image} />
                        <Text style={styles.text}>Of course.</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.questionText}>Are you a farmer or consumer?</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowWrapper: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '80%',
        marginBottom: 20,
    },
    farmerContainer: {
        alignItems: 'center',
        width: '45%',
        padding: 10,
    },
    consumerContainer: {
        alignItems: 'center',
        width: '45%',
        padding: 10,
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 10, 
    },
    farmerButton: {
        padding: 10,
        borderRadius: 5,
    },
    consumerButton: {
        padding: 10,
        borderRadius: 5,
    },
    text: {
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
    questionText: {
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
        marginTop: 20,
    },
});
