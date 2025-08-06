import * as React from "react";
import { supabase } from "../../lib/supabase"; // adjust path if needed
import { Alert } from "react-native";

// new imports for medical disclaimer
import { Modal, ScrollView } from "react-native";
import Checkbox from "expo-checkbox"; // run: `npm install expo-checkbox`

import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const router = useRouter();

  const [disclaimerVisible, setDisclaimerVisible] = React.useState(true);
  const [disclaimerChecked, setDisclaimerChecked] = React.useState(false);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  const onSignUpPress = async () => {
    if (!disclaimerChecked) {
      Alert.alert(
        "Disclaimer Required",
        "You must agree to the medical disclaimer before signing up."
      );
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: emailAddress,
      password,
    });

    if (error) {
      Alert.alert("Sign Up Failed", error.message);
    } else {
      Alert.alert(
        "Check your email",
        "A confirmation link has been sent to verify your account.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)"),
          },
        ]
      );
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(home)");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <>
      <Modal
        visible={disclaimerVisible}
        animationType="slide"
        transparent={false}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 80 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
            Medical Disclaimer
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24 }}>
            Koa is an AI-powered virtual wellness assistant, not a licensed
            medical professional. It does not provide medical advice, diagnosis,
            or treatment. All content provided through this application is for
            general informational and wellness purposes only and is not a
            substitute for professional healthcare advice.{"\n\n"}
            Using Koa does not establish a therapist-patient or provider-client
            relationship. Koa cannot replace the expertise, judgment, or care of
            qualified healthcare professionals.{"\n\n"}
            Always seek licensed medical professionals before making changes to
            your health or treatment plans.{"\n\n"}
            If you are experiencing a medical emergency, dial 911 immediately.
            For mental health crises or suicidal thoughts, contact:{"\n"}• 988
            Suicide & Crisis Lifeline{"\n"}• Crisis Text Line: Text HOME to
            741741{"\n"}• Emergency Services: 911{"\n\n"}
            Koa is not capable of diagnosing medical or psychiatric conditions.
            Information may not apply to your specific circumstances.{"\n\n"}
            This app is intended for individuals 18 years or older. Any personal
            data collected is subject to our Privacy Policy.{"\n\n"}
            By using Koamigo and its content, you agree that Koamigo is not
            liable for any harm or damages arising out of, or on the account of,
            any use, operation, reference, or reliance of Koamigo, and you
            further agree to accept full responsibility for any actions taken
            based on Koamigo and its content. {"\n\n"}You agree to hold Koamigo,
            its officers, employees, and affiliates, harmless for any claims,
            lawsuits, or other actions arising out of, or on the account of, any
            use, operation, reference, or reliance of Koamigo.
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 30,
            }}
          >
            <Checkbox
              value={disclaimerChecked}
              onValueChange={setDisclaimerChecked}
              color={disclaimerChecked ? "#196315" : undefined}
            />
            <Text style={{ marginLeft: 10, fontSize: 16 }}>
              I have read and agree to the medical disclaimer.
            </Text>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 30,
              backgroundColor: disclaimerChecked ? "#196315" : "#ccc",
              padding: 15,
              borderRadius: 10,
              alignItems: "center",
            }}
            onPress={() => {
              if (disclaimerChecked) setDisclaimerVisible(false);
            }}
            disabled={!disclaimerChecked}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              Continue to Sign Up
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to start your wellness journey
          </Text>
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

          <TouchableOpacity style={styles.signUpButton} onPress={onSignUpPress}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
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
  signUpButton: {
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
  signUpButtonText: {
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
  signInLink: {
    fontSize: 16,
    color: "#196315",
    fontWeight: "bold",
  },
});
