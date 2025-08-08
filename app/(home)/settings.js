import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase"; // adjusted path
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const BACKEND_URL = "https://koamigo.fly.dev";

export default function SettingsScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // handles sign out
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/(auth)"); // adjust route to your auth entry screen
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // handles account deletion confirmation
  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // 1) try to get current session
      let {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession();

      // 2) if missing, try refresh (can happen after reinstall/dev client updates)
      if (!session) {
        const { data: refreshed, error: refreshErr } =
          await supabase.auth.refreshSession();
        if (refreshErr) console.log("🔄 refreshSession error:", refreshErr);
        session = refreshed?.session ?? null;
      }

      // 3) still no session? show a helpful prompt
      if (!session?.access_token) {
        Alert.alert(
          "Not signed in",
          "Please log in again, then delete your account."
        );
        return;
      }

      // call backend delete route
      const res = await fetch(`${BACKEND_URL}/api/delete-account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete failed:", res.status, text);
        Alert.alert("Error", "Delete failed. See logs.");
        return;
      }

      // sign out locally
      await supabase.auth.signOut();

      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)"),
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* Sign Out */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="logout" size={24} color="#196315" />
              <Text style={styles.settingText}>Sign Out</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={confirmDeleteAccount}
            disabled={isDeleting}
          >
            <View style={styles.settingLeft}>
              <FontAwesome5 name="trash-alt" size={20} color="#d32f2f" />
              <Text style={[styles.settingText, styles.dangerText]}>
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Text>
            </View>
            {isDeleting ? (
              <ActivityIndicator color="#d32f2f" />
            ) : (
              <MaterialIcons name="chevron-right" size={24} color="#d32f2f" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#196315",
  },
  section: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    padding: 20,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
  dangerItem: {
    backgroundColor: "#fff5f5",
  },
  dangerText: {
    color: "#d32f2f",
    fontWeight: "500",
  },
});
