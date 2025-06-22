import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  progress,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function HomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(96);
  const percentage = Math.min(((progress + 3) / 100) * 100, 100);
  const windowWidth = window.innerWidth;

  const mapImages = {
    full: require("../../assets/images/ForestMapEmptyPathFlagged.png"),
    min: require("../../assets/images/ForestMapEmptyPath.png"),
    fullWinter: require("../../assets/images/WinterMapEmptyPathFlagged.png"),
    minWinter: require("../../assets/images/WinterMapEmptyPath.png"),
  };

  const [map, setMap] = useState("full");

  if (windowWidth >= 1000 && map.length == 3) {
    setMap("full");
  } else if (windowWidth < 1000 && map.length == 4) {
    setMap("min");
  }

  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>KoaCoach</Text>
        <View
          style={styles.imageContainer}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setImageWidth(width);
            setImageHeight(height);
          }}
        >
          <View
            style={{
              position: "absolute",
              width: imageWidth,
              height: imageHeight,
            }}
          >
            <View
              style={[
                styles.progressBar,
                { width: `${percentage}%`, height: imageHeight },
              ]}
            />
          </View>
          <Image source={mapImages[map]} style={styles.mapImage} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#196315" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <FontAwesome5 name="robot" size={40} color="#196315" />
          <Text style={styles.cardTitle}>AI Support Assistant</Text>
          <Text style={styles.cardDescription}>
            Get immediate support through our advanced AI voice agent. Available
            24/7 for guidance and emotional support.
          </Text>
        </View>

        <View style={styles.card}>
          <FontAwesome5 name="hand-holding-heart" size={40} color="#196315" />
          <Text style={styles.cardTitle}>Personalized Matching</Text>
          <Text style={styles.cardDescription}>
            Our intelligent system matches you with therapists who best fit your
            unique needs and preferences.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push("/therapist")}
        >
          <Text style={styles.startButtonText}>Find Your Perfect Match</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  welcomeText: {
    fontSize: 24,
    color: "#333",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#196315",
    marginTop: 5,
  },
  logoutButton: {
    position: "absolute",
    top: 60,
    right: 20,
    padding: 10,
  },
  cardContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#196315",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: "#196315",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  mapImage: {
    width: "100%",
    height: undefined, // use aspectRatio if you want
    aspectRatio: 1, // or use actual image ratio
    borderRadius: 8,
  },

  progressBar: {
    backgroundColor: "green", // or whatever your color is
    borderRadius: 8,
  },
});
