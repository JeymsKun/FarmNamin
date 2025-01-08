import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Button } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useGlobalState } from "../context/GlobalState";

export default function VideoPlayer() {
  const router = useRouter();
  const { selectedVideo } = useGlobalState();

  const player = useVideoPlayer(selectedVideo, (player) => {
    player.loop = true;
    player.play();
  });

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      <View style={styles.controlsContainer}>
        <Button
          title={player.playing ? "Pause" : "Play"}
          onPress={() => {
            if (player.playing) {
              player.pause();
            } else {
              player.play();
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    padding: 10,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
