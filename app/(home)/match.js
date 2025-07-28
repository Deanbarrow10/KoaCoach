// match.js

// Import necessary React and React Native components
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";

// Navigation hook from Expo Router
import { useRouter } from "expo-router";

// Importing icon library
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Main functional component for therapist matching screen
const MatchScreen = () => {
  // State to control visibility of the matched therapist card
  const [showRosyCard, setShowRosyCard] = useState(false);

  // State to control visibility of the message modal
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Array of messages exchanged between user and "Rosy"
  const [messages, setMessages] = useState([]);

  // Text input state for composing new messages
  const [inputText, setInputText] = useState("");

  // Router instance for navigation (unused here but available)
  const router = useRouter();

  // Called when the user taps "Match Me" button
  // Reveals the card with therapist information
  const handleMatch = () => {
    setShowRosyCard(true);
  };

  // Called when user sends a message
  // Appends user's message and a default Rosy reply
  const handleSend = () => {
    if (inputText.trim()) {
      const userMsg = { role: "user", content: inputText.trim() };
      const rosyReply = {
        role: "rosy",
        content: "Dr. Emily Kelce will respond shortly...",
      };
      setMessages((prev) => [...prev, userMsg, rosyReply]);
      setInputText(""); // Clear input field after sending
    }
  };

  // Renders a single message bubble depending on sender (user or Rosy)
  const renderMessage = ({ item }) => (
    <View
      style={item.role === "user" ? styles.userMessage : styles.rosyMessage}
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  // Main return block with full screen layout
  return (
    <View style={styles.container}>
      {/* Notification box to indicate onboarding status */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          Currently onboarding therapists, updates coming soon!
        </Text>
      </View>

      {/* Button that initiates the match process */}
      <TouchableOpacity style={styles.matchButton} onPress={handleMatch}>
        <Text style={styles.matchButtonText}>Match Me</Text>
      </TouchableOpacity>

      {/* Conditional rendering of therapist card after matching */}
      {showRosyCard && (
        <TouchableOpacity
          style={styles.rosyCard}
          onPress={() => setShowMessageModal(true)}
        >
          {/* Therapist profile picture */}
          <Image
            source={require("../../assets/images/match-therapist.png")}
            style={styles.rosyImage}
          />

          {/* Therapist details */}
          <View style={styles.rosyInfo}>
            <Text style={styles.name}>Dr. Emily Kelce</Text>
            <Text style={styles.meta}>
              <Text style={{ fontWeight: "bold" }}>Pronouns:</Text> She/Her
            </Text>
            <Text style={styles.meta}>
              <Text style={{ fontWeight: "bold" }}>Background:</Text> Dr. Emily
              Kelce is a licensed clinical psychologist with over 10 years of
              experience in cognitive behavioral techniques. Her approach blends
              evidence-based methods with a compassionate, collaborative style
              that empowers clients to take charge of their healing. She is
              currently accepting new clients.
            </Text>
            <Text style={styles.meta}>
              <Text style={{ fontWeight: "bold" }}>Availability:</Text> Weekdays
              10am - 6pm (EST)
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Modal popup for message-based interaction with therapist */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={false}
      >
        <View style={{ flex: 1 }}>
          {/* Close button for modal */}
          <Pressable
            onPress={() => setShowMessageModal(false)}
            style={{ padding: 22, backgroundColor: "#eee" }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#196315",
                fontWeight: "bold",
              }}
            >
              Close
            </Text>
          </Pressable>

          {/* Message interaction view with keyboard-safe behavior */}
          <KeyboardAvoidingView
            style={styles.messageModal}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Scrollable list of messages */}
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(_, index) => index.toString()}
              style={styles.messageList}
            />

            {/* Message input area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                multiline
              />
              {/* Send button with icon */}
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

// StyleSheet for layout and UI design
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  matchButton: {
    backgroundColor: "#196315",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 16,
  },
  matchButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  rosyCard: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  rosyImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  rosyInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    marginBottom: 2,
  },
  messageModal: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  userMessage: {
    backgroundColor: "#07db78",
    alignSelf: "flex-end",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  rosyMessage: {
    backgroundColor: "#E9E9EB",
    alignSelf: "flex-start",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  messageText: {
    color: "#000",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9E9EB",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E9E9EB",
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#196315",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  noticeBox: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    marginBottom: 12,
    marginTop: 14,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FFC107",
  },
  noticeText: {
    color: "#856404",
    fontSize: 14,
    fontWeight: "500",
  },
});

// Exporting the MatchScreen component for use in the app
export default MatchScreen;
