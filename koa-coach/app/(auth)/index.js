import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");

export default function AuthLandingPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    };

    checkSession();
  }, []);

  return (
    <>
      {isSignedIn ? (
        <SafeAreaView
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={styles.title}>Welcome Back</Text>
        </SafeAreaView>
      ) : (
        <LinearGradient
          colors={["#3aa76b", "#1f7442", "#196315"]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              <Image
                style={styles.logo}
                source={require("../../assets/images/main-logo.png")}
                resizeMode="contain"
              />
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>KoaCoach</Text>
              <Text style={styles.subtitle}>
                Your Wellness Journey Starts Here
              </Text>
              <Link href="/(auth)/sign-up" style={styles.signupButton}>
                <Text style={styles.signupText}>Sign up</Text>
              </Link>
              <Link href="/(auth)/sign-in" style={styles.loginButton}>
                <Text style={styles.signupText}>Log in</Text>
              </Link>
            </View>
          </SafeAreaView>
        </LinearGradient>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  logo: {
    width: width * 0.5,
    height: height * 0.3,
    marginBottom: -120,
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
    color: "white",
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "white",
  },
  signupButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 38,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  signupText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
});
