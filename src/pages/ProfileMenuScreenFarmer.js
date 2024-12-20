import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Dialog from "react-native-dialog"; 

const ProfileMenuScreen = () => {
  const navigation = useNavigation();
  const [dialogVisible, setDialogVisible] = useState(false); 

  
  const handleLogout = () => {
    setDialogVisible(true);
  };

  // Handle "Yes" button press
  const handleConfirmLogout = () => {
    console.log("User logged out");
    setDialogVisible(false); // Close the dialog
  };

  // Handle "No" button press
  const handleCancelLogout = () => {
    console.log("User chose not to log out");
    setDialogVisible(false); // Close the dialog
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/images/profilepic.jpg")}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Jojo Romeyo Terada Jr</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <MenuItem
          icon={require("../assets/images/edet.png")}
          text="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <MenuItem
          icon={require("../assets/images/verify.png")}
          text="Verification"
          onPress={() => navigation.navigate("Verification")}
        />
        <MenuItem
          icon={require("../assets/images/assist.png")}
          text="Agent Assist Program"
          onPress={() => navigation.navigate("AgentAssist")}
        />
        <MenuItem
          icon={require("../assets/images/logout.png")}
          text="Log out"
          onPress={handleLogout}
        />

        {/* Separator (Black line between Log out and the rest) */}
        <View style={styles.blackSeparator} />

        {/* Clickable Text Items */}
        <ClickableText
          text="Terms and Conditions"
          onPress={() => Alert.alert("Terms and Conditions clicked")}
        />
        <ClickableText
          text="Privacy Policy"
          onPress={() => Alert.alert("Privacy Policy clicked")}
        />
        <ClickableText
          text="About Us"
          onPress={() => Alert.alert("About Us clicked")}
        />
      </View>

      {/* App Version */}
      <Text style={styles.version}>App version 1.2</Text>

      {/* Custom Logout Dialog */}
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Description>Are you sure you want to log out?</Dialog.Description>
        <Dialog.Button label="Yes" style={styles.dialogButtonYes} onPress={handleConfirmLogout} />
        <Dialog.Button label="No" style={styles.dialogButtonNo} onPress={handleCancelLogout} />
      </Dialog.Container>
    </View>
  );
};

// Reusable Menu Item Component
const MenuItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Image source={icon} style={styles.iconImage} />
    <Text style={styles.menuText}>{text}</Text>
  </TouchableOpacity>
);

// Reusable Clickable Text Component
const ClickableText = ({ text, onPress }) => (
  <TouchableOpacity style={styles.textItem} onPress={onPress}>
    <Text style={styles.textLink}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#34A853",
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34A853",
  },
  menu: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  iconImage: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  blackSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#000", 
    marginVertical: 10,
  },
  textItem: {
    paddingVertical: 8,
  },
  textLink: {
    fontSize: 16,
    color: "#000", 
    fontWeight: "bold",
  },
  version: {
    textAlign: "center",
    color: "#777",
    fontSize: 12,
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  dialogButtonYes: {
    color: 'green', // Green color for "Yes" button
  },
  dialogButtonNo: {
    color: 'red', // Red color for "No" button
  },
});

export default ProfileMenuScreen;
