import { supabase } from "../../lib/supabase";
import { Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function Page() {
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  const onSignInPress = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailAddress,
      password,
    });

    if (error) {
      Alert.alert("Login failed", error.message);
    } else {
      router.replace("/(home)");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={20}
            color="#196315"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#665"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="lock"
            size={20}
            color="#196315"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#665"
            secureTextEntry={secureTextEntry}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={styles.eyeIcon}
          >
            <MaterialIcons
              name={secureTextEntry ? "visibility" : "visibility-off"}
              size={20}
              color="#665"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signInButton} onPress={onSignInPress}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 100,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#196315",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#665",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f8f8f8",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 10,
  },
  signInButton: {
    backgroundColor: "#196315",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: "#665",
  },
  signUpLink: {
    fontSize: 16,
    color: "#196315",
    fontWeight: "bold",
  },
});
