import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Dialog from "react-native-dialog"; 
import { supabase } from '../backend/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const ProfileMenuScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [dialogVisible, setDialogVisible] = useState(false); 
  const subscriptionRef = useRef(null);
  const [profile, setProfile] = useState({});
  
  useEffect(() => {
    if (user) {
      console.log('Current user navigating to Profile Settings Screen:', user);
      loadData();
    }
  }, [user]); 

  const loadData = async () => {
    if (!user) return;
  
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id_user, first_name, last_name, middle_name, suffix')
        .eq('id_user', user.id_user);
  
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
  
      if (data && data.length > 0) {
        setProfile(data);
      } else {
        console.log('No profile data found.');
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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async (payload) => {
          console.log('Database change detected:', payload);
          await loadData();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to user changes.');
          }
        });
  
      subscriptionRef.current = subscription;
    } catch (err) {
      console.error('Error subscribing to database changes:', err);
    }
  };
          
  useEffect(() => {
    loadData().then(() => listenForChanges());
  
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);  

  const handleLogout = () => {
    setDialogVisible(true);
  };

  const handleConfirmLogout = () => {
    console.log("User logged out");
    navigation.navigate('LogIn');
    setDialogVisible(false);
  };

  const handleCancelLogout = () => {
    console.log("User chose not to log out");
    setDialogVisible(false); 
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/profilepic.jpg")}
          style={styles.profileImage}
        />
        <Text style={styles.name}>
          {`${(profile?.first_name || '').trim()} ${(profile?.last_name || '').trim()} ${(profile?.middle_name || '').trim()} ${profile?.suffix || ''}`}
        </Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <MenuItem
          icon={require("../../assets/images/edet.png")}
          text="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <MenuItem
          icon={require("../../assets/images/verify.png")}
          text="Verification"
          onPress={() => navigation.navigate("Verification")}
        />
        <MenuItem
          icon={require("../../assets/images/assist.png")}
          text="Agent Assist Program"
          onPress={() => navigation.navigate("AgentAssist")}
        />
        <MenuItem
          icon={require("../../assets/images/logout.png")}
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
