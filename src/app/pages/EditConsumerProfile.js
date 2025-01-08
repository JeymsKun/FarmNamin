import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import fetchProfileData from "../utils/fetchProfileData";
import { setProfile } from "../store/profileSlice";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { v4 as uuidv4 } from "uuid";
import supabase from "../admin/supabaseClient";
import useRealTimeUpdates from "../hooks/useRealTimeUpdates";
import CustomAlert from "../support/CustomAlert";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const EditProfileScreen = () => {
  const { user } = useAuth();
  const userId = user?.id_user;
  const router = useRouter();
  const dispatch = useDispatch();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoWarning, setCoverPhotoWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["profile", user?.id_user],
    queryFn: () => fetchProfileData(user.id_user),
    enabled: !!user,
    onSuccess: (data) => {
      dispatch(setProfile(data));
    },
  });

  useRealTimeUpdates(user?.id_user);

  useFocusEffect(
    React.useCallback(() => {
      refetchProfile();
    }, [])
  );

  const DEFAULT_COVER_PHOTO = require("../assets/main/default_cover_photo.png");
  const DEFAULT_PROFILE_IMAGE = require("../assets/main/default_profile_photo.png");

  const handleOpenGallery = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        "Gallery Access Permission Needed",
        "Permission to access camera roll is required!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: type === "profile",
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      const { width: imgWidth, height: imgHeight } = result.assets[0];

      if (type === "profile") {
        setProfilePhoto(selectedImageUri);
      } else if (type === "cover") {
        if (imgWidth < imgHeight) {
          setCoverPhotoWarning(
            "*Cover photo should be in landscape orientation."
          );
          setTimeout(() => {
            setCoverPhotoWarning("");
          }, 3000);
          return;
        }
        setCoverPhotoWarning("");
        setCoverPhoto(selectedImageUri);
      }
    }
  };

  const handleUploadImageToSupabase = async (image) => {
    try {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        const base64FileData = base64data.split(",")[1];
        const arrayBuffer = decode(base64FileData);

        const { error } = await supabase.storage
          .from("user")
          .upload(`${uuidv4()}.png`, arrayBuffer, {
            contentType: "image/png",
          });

        if (error) {
          console.error("Error uploading image:", error);
          return null;
        }
      };
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);

    try {
      const imagesToUpload = [];
      let hasChanges = false;

      if (profilePhoto && profilePhoto !== profile?.profile_pic) {
        imagesToUpload.push({ uri: profilePhoto });
        hasChanges = true;
      }

      if (coverPhoto && coverPhoto !== profile?.cover_photo) {
        imagesToUpload.push({ uri: coverPhoto });
        hasChanges = true;
      }

      if (!hasChanges) {
        showAlert("No changes detected", "There are no new changes to save.");
        return;
      }

      await Promise.all(
        imagesToUpload.map((image) => handleUploadImageToSupabase(image))
      );

      const { data, error } = await supabase
        .from("users")
        .update({
          profile_pic: profilePhoto ? profilePhoto : profile?.profile_pic,
          cover_photo: coverPhoto ? coverPhoto : profile?.cover_photo,
        })
        .eq("id_user", userId);

      if (error) {
        console.error("Error updating profile:", error);
        showAlert(
          "Error",
          "There was an error updating your profile. Please try again."
        );
      } else {
        showAlert("Success", "Profile updated successfully");
      }
    } catch (error) {
      console.error("Unexpected error during profile update:", error);
      showAlert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={35} color="#34A853" />
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <Text style={styles.subTitle}>Profile Picture</Text>
      <View style={styles.profileSection}>
        <Image
          source={
            profilePhoto
              ? { uri: profilePhoto }
              : profile?.profile_pic
              ? { uri: profile.profile_pic }
              : DEFAULT_PROFILE_IMAGE
          }
          style={styles.profileImage}
          resizeMode="cover"
        />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleOpenGallery("profile")}
        >
          <Text style={styles.buttonText}>Upload new profile photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.line} />

      <Text style={styles.subTitle}>Cover Photo</Text>
      <View style={styles.coverSection}>
        <Image
          source={
            coverPhoto
              ? { uri: coverPhoto }
              : profile?.cover_photo
              ? { uri: profile.cover_photo }
              : DEFAULT_COVER_PHOTO
          }
          style={styles.coverImage}
        />
        {coverPhotoWarning ? (
          <Text style={styles.warningText}>{coverPhotoWarning}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleOpenGallery("cover")}
        >
          <Text style={styles.buttonText}>Upload new cover photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.line} />

      <View style={styles.wrapContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          {isLoading ? (
            <ActivityIndicator size={24} color="white" />
          ) : (
            <Text style={styles.buttonText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/pages/EditConsumerBasicInfo")}
        >
          <Text style={styles.buttonText}>Edit basic info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/pages/EditConsumerAccount")}
        >
          <Text style={styles.buttonText}>Edit account details</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: width * 0.05,
  },
  header: {
    padding: 10,
    marginBottom: height * 0.03,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
  },
  title: {
    fontSize: width * 0.045,
    fontFamily: "medium",
    textAlign: "center",
  },
  line: {
    height: 2,
    backgroundColor: "#555",
    marginVertical: height * 0.02,
  },
  subTitle: {
    marginTop: 20,
    fontSize: width * 0.04,
    fontFamily: "medium",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  coverSection: {
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  profileImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    marginBottom: height * 0.02,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  coverImage: {
    width: "100%",
    height: height * 0.2,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  warningText: {
    fontFamily: "regular",
    fontSize: 12,
    position: "absolute",
    top: 10,
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: width * 0.035,
    fontFamily: "medium",
    textAlign: "center",
  },
  wrapContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    width: "48%",
    padding: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 20,
    width: "48%",
    alignItems: "center",
  },
});

export default EditProfileScreen;
