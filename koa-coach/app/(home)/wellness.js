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
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const TeachingCard = ({ title, description, icon }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardHeader}>
      <MaterialIcons name={icon} size={24} color="#196315" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={styles.cardDescription}>{description}</Text>
  </TouchableOpacity>
);

const WellnessScreen = () => {
  const [activeTab, setActiveTab] = useState("teachings");

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wellness Journey</Text>
        <Text style={styles.headerSubtitle}>
          Discover wisdom for better living
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {teachings.map((teaching, index) => (
            <TeachingCard key={index} {...teaching} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    elevation: 3,
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

export default WellnessScreen;
