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
  Animated,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

function subScore(x) {
  if (x - 100 > 0) {
    return x - 100;
  } else {
    return x;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [score, setScore] = useState(67);
  const [progress, setProgress] = useState(subScore(score));
  const percentage = Math.min((progress / 100) * 100, 100);
  const windowWidth = window.innerWidth;
  const windowLimit = 1000;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const mapImages = {
    full: require("../../assets/images/ForestMapEmptyPathFlagged.png"),
    min: require("../../assets/images/ForestMapEmptyPath.png"),
    fullWinter: require("../../assets/images/WinterMapEmptyPathFlagged.png"),
    minWinter: require("../../assets/images/WinterMapEmptyPath.png"),
  };

  const [map, setMap] = useState("full");
  const [barcolor, setbarcolor] = useState("green");
  const [shouldFade, setshouldFade] = useState(0);
  const [faded, setfaded] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: shouldFade ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setfaded(1);
      }
    });
  }, [shouldFade]);

  if (score > 100 && shouldFade == 0 && (map.length == 3 || map.length == 4)) {
    setshouldFade(1);
  }
  console.log(fadeAnim);
  if (score > 100 && faded && (map.length == 3 || map.length == 4)) {
    setfaded(0);
    setbarcolor("gray");
    setMap("fullWinter");
    setshouldFade(0);
  }

  if (windowWidth >= windowLimit && map.length == 3) {
    setMap("full");
  } else if (windowWidth < windowLimit && map.length == 4) {
    setMap("min");
  } else if (windowWidth >= windowLimit && map.length == 9) {
    setMap("fullWinter");
  } else if (windowWidth < windowLimit && map.length == 10) {
    setMap("minWinter");
  }

  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const koalaOffset = 20;

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
          {/* Progress Bar */}
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
                {
                  width: `${percentage}%`,
                  height: imageHeight,
                  backgroundColor: barcolor,
                },
              ]}
            />
          </View>

          {/* Text Overlay */}
          <View style={styles.textOverlay}>
            <Text style={styles.overlayText}>{score} WXP</Text>
          </View>

          {/* Map Image */}
          <Image source={mapImages[map]} style={styles.mapImage} />

          {/* Koala overlay ON TOP of map but UNDER black overlay */}
          <View
            style={[
              styles.koalaOverlayWrapper,
              {
                left: (percentage / 100) * imageWidth - koalaOffset,
              },
            ]}
          >
            <Image
              source={require("../../assets/images/koala_on_map_crop.png")}
              style={styles.koalaOverlay}
            />
          </View>

          {/* Black Overlay on top of everything else */}
          <Animated.View style={[styles.blackOverlay, { opacity: fadeAnim }]} />
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
    height: undefined,
    aspectRatio: 1,
    borderRadius: 8,
  },

  progressBar: {
    borderRadius: 8,
  },

  textOverlay: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },

  overlayText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },

  blackOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 5,
  },
  koalaOverlayWrapper: {
    position: "absolute",
    bottom: 25,
    zIndex: 4,
  },

  koalaOverlay: {
    width: 90,
    height: 140,
    resizeMode: "contain",
  },
});
