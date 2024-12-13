import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get("window");

const NUM_LINES = 4;  
const NUM_CUTS_PER_ROW = 5; 

const WelcomeScreen = ({ route }) => {
    const { role, name } = route.params;
    const navigation = useNavigation();
    const [lineAnimations] = useState(
        Array.from({ length: NUM_LINES }).map(() =>
            Array.from({ length: NUM_CUTS_PER_ROW }).map(() => new Animated.Value(-20))
        )
    );

    useFocusEffect(
        React.useCallback(() => {
        const onBackPress = () => {
            return true;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );

    const animateRow = (rowIndex) => {
        const animations = lineAnimations[rowIndex];

        animations.forEach((anim, index) => {
            setTimeout(() => {
                Animated.timing(anim, {
                toValue: width,
                duration: 2000 + index * 300,
                useNativeDriver: false,
                }).start();
            }, index * 300);
        });

        setTimeout(() => {
        const nextRow = rowIndex + 1;
            if (nextRow < NUM_LINES) {
                animateRow(nextRow);
            }
        }, NUM_CUTS_PER_ROW * 300 + 1000);
    };

    useEffect(() => {
        animateRow(0);

        const timer = setTimeout(() => {
            navigation.navigate("HomeTabs", { role, name });
        }, 10000);

        return () => clearTimeout(timer);
    }, [navigation, lineAnimations]);

  return (
    <View style={styles.container}>
        <View style={styles.welcomeWrapper}>
            <Text style={styles.topText}>
                <Text style={{ color: "#4CAF50" }}>You are very welcome.</Text> 
            </Text>
                
            <Text style={styles.bottomText}>
                <Text style={{ color: "#28B805" }}>{`Our Beloved ${role === "farmer" ? "Farmer" : "Consumer"},`}</Text> 
            </Text>

            <Text style={styles.name}>
                <Text style={{ color: "#1E972A" }}>{name}</Text> 
            </Text>
        </View>

        <View style={styles.loadingContainer}>
            {lineAnimations.map((row, rowIndex) =>
                row.map((anim, index) => (
                    <Animated.View
                    key={`${rowIndex}-${index}`}
                        style={[
                            styles.loadingLine,
                            {
                            left: anim,
                            backgroundColor: "#4AF146",
                            },
                        ]}
                    />
                ))
            )}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    welcomeWrapper: {
        padding: 10,
    },
    topText: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 20,
    },
    bottomText: {
        fontSize: 26,
        marginBottom: 20,
    },
    name: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
    },
    loadingContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 50,
        overflow: "hidden",
    },
    loadingLine: {
        position: "absolute",
        height: 10,
        width: 80,
        borderRadius: 20,
        backgroundColor: "#4AF146",
        marginVertical: 2,
    },
});

export default WelcomeScreen;
