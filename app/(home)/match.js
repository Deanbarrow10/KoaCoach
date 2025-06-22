// match.js
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
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MatchScreen = () => {
  const [showRosyCard, setShowRosyCard] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const router = useRouter();

  const handleMatch = () => {
    setShowRosyCard(true);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      const userMsg = { role: "user", content: inputText.trim() };
      const rosyReply = {
        role: "rosy",
        content: "Dr. Emily Kelce will respond shortly...",
      };
      setMessages((prev) => [...prev, userMsg, rosyReply]);
      setInputText("");
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={item.role === "user" ? styles.userMessage : styles.rosyMessage}
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          Currently onboarding therapists, updates coming soon!
        </Text>
      </View>
      <TouchableOpacity style={styles.matchButton} onPress={handleMatch}>
        <Text style={styles.matchButtonText}>Match Me</Text>
      </TouchableOpacity>

      {showRosyCard && (
        <TouchableOpacity
          style={styles.rosyCard}
          onPress={() => setShowMessageModal(true)}
        >
          <Image
            source={require("../../assets/images/match-therapist.png")}
            style={styles.rosyImage}
          />
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

      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={false}
      >
        <View style={{ flex: 1 }}>
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
          <KeyboardAvoidingView
            style={styles.messageModal}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(_, index) => index.toString()}
              style={styles.messageList}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                multiline
              />
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

export default MatchScreen;
