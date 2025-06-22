import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Dimensions,
} from "react-native";

import { Link } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

export default function App() {
  return (
    <LinearGradient
      colors={["#e8f4f0", "#c5e1d3", "#97ceb3"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image
            style={styles.logo}
            source={require("../assets/images/main-logo.png")}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Acts.ai</Text>
          <Text style={styles.subtitle}>The Future of Mental Health</Text>
          <Pressable style={styles.signupButton}>
            <Text style={styles.signupText}>Sign up</Text>
          </Pressable>

          <Pressable style={styles.loginButton}>
            <Text style={styles.signupText}>Log in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    // backgroundColor: "#b4c8bd",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  navBarLine: {
    backgroundColor: "#000",
    height: 2,
    marginHorizontal: 0,
  },
  logo: {
    width: width * 0.5,
    height: height * 0.3,
    marginBottom: -120,
  },
  loginButton: {
    padding: 8,
  },
  loginText: {
    fontSize: 16,
    color: "#000",
  },
  content: {
    marginBottom: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#000",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#000",
  },
  signupButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  loginButton: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 38,
    borderRadius: 25,
  },
  signupText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
});
