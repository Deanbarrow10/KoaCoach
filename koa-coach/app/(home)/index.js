import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function HomePage() {
  const router = useRouter();

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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#196315" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.koalaIcon}
            resizeMode="contain"
          />

          <Text style={styles.cardTitle}>Wellness Coach</Text>
          <Text style={styles.cardDescription}>
            Koa is your personalized wellness coach, helping you achieve your
            goals and improve your overall well-being.
          </Text>
        </View>

        <View style={styles.card}>
          <FontAwesome5 name="hand-holding-heart" size={40} color="#196315" />
          <Text style={styles.cardTitle}>Mindfulness</Text>
          <Text style={styles.cardDescription}>
            Koa helps you stay present and focused, reducing stress and anxiety.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push("/therapist")}
        >
          <Text style={styles.startButtonText}>Talk to Koa!</Text>
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
  koalaIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
});
