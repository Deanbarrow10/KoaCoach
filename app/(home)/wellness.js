// Imports core React and React Native modules
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";

// Icons from Expo's vector icon libraries
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

// Get screen width for responsive layouts if needed
const { width } = Dimensions.get("window");

// A single reusable card that represents one piece of advice
const TeachingCard = ({ title, description, icon }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardHeader}>
      <MaterialIcons name={icon} size={24} color="#196315" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={styles.cardDescription}>{description}</Text>
  </TouchableOpacity>
);

// Main component for the "Wellness" tab
const WellnessScreen = () => {
  // Used for switching between tabs, only one for now
  const [activeTab, setActiveTab] = useState("teachings");

  // List of wellness advice with icons and short descriptions
  const teachings = [
    {
      title: "Love Deeply",
      description: "Cherish yourself and extend that same care to others.",
      icon: "favorite",
    },
    {
      title: "Follow Your Purpose",
      description: "Embrace challenges as part of your journey.",
      icon: "explore",
    },
    {
      title: "Prioritize What Matters",
      description: "Focus on building a better world for all.",
      icon: "stars",
    },
    {
      title: "Believe in Possibilities",
      description: "Nothing is truly impossible with unwavering faith.",
      icon: "lightbulb",
    },
    {
      title: "Practice Forgiveness",
      description: "Let go of grudges to free yourself and others.",
      icon: "healing",
    },
    {
      title: "Serve Humbly",
      description: "True leadership comes from putting others first.",
      icon: "volunteer-activism",
    },
    {
      title: "Share Your Story",
      description: "Inspire others with your experiences and wisdom.",
      icon: "book",
    },
    {
      title: "Stay True to Your Path",
      description: "Trust in your inner compass to guide you.",
      icon: "navigation",
    },
    {
      title: "Inspire Others",
      description: "Let your actions motivate positive change.",
      icon: "emoji-objects",
    },
    {
      title: "Find Inner Peace",
      description: "Seek solace in moments of stillness and reflection.",
      icon: "self-improvement",
    },
  ];

  // Main return block with UI structure
  return (
    <SafeAreaView style={styles.container}>
      {/* Top header text */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Koa's Advice</Text>
        <Text style={styles.headerSubtitle}>
          Tips for improving your well-being
        </Text>
      </View>

      {/* Scrollable container for all teaching cards */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {/* Render each teaching as a TeachingCard */}
          {teachings.map((teaching, index) => (
            <TeachingCard key={index} {...teaching} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for layout, spacing, and color
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#665",
    marginTop: 4,
  },
  tabs: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFF",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#196315",
  },
  tabText: {
    fontSize: 16,
    color: "#665",
  },
  activeTabText: {
    color: "#FFF",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: "#665",
    lineHeight: 20,
  },
});

// Export screen component to be used in the app's navigation
export default WellnessScreen;
