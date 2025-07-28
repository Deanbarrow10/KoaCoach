import { Tabs } from "expo-router/tabs";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FontAwesome6 } from "@expo/vector-icons";

// Bottom tab layout for app navigation
export default function Layout() {
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: "#196315", headerShown: false }}
    >
      {/* Home tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
      {/* Wellness tab */}
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="heart" color={color} size={size} />
          ),
        }}
      />
      {/* Therapist tab */}
      <Tabs.Screen
        name="therapist"
        options={{
          title: "Therapist",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="book-open-reader" color={color} size={size} />
          ),
        }}
      />
      {/* Match tab */}
      <Tabs.Screen
        name="match"
        options={{
          title: "Match",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="people-arrows" color={color} size={size} />
          ),
        }}
      />
      {/* Journal tab */}
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="pencil" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
