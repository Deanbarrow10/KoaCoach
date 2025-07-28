/** therapist.js defines the AI voice-based therapist chat interface for the app.
 *  it handles multilingual messaging, records voice, sends data to backend, detects safety issues,
 *  and plays AI-generated responses with Google TTS
 */

// React and React Native core imports
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
  Easing,
} from "react-native";

// Local storage for user preferences
import AsyncStorage from "@react-native-async-storage/async-storage";

// Anthropic SDK imported (not used in this file but likely relevant to future features)
import Anthropic from "@anthropic-ai/sdk";

// Expo audio recording and playback
import { Audio } from "expo-av";

// For saving and uploading files like audio recordings
import * as FileSystem from "expo-file-system";

// Icons used in the UI
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

// Mapping of language codes to flag icons
const flagIcons = {
  en: require("../../assets/flags/uk.png"),
  es: require("../../assets/flags/spain.png"),
  fr: require("../../assets/flags/france.png"),
  zh: require("../../assets/flags/china.png"),
  hi: require("../../assets/flags/india.png"),
};

// Mapping of language codes to display names
const languageNames = {
  en: "English",
  es: "Spanish",
  fr: "French",
  zh: "Chinese (Mandarin)",
  hi: "Hindi",
};

// Log OpenAI key prefix to ensure it's loaded from env
console.log(
  "🔐 OpenAI Key Loaded:",
  process.env.EXPO_PUBLIC_OPENAI_API_KEY?.slice(0, 10)
);

// Main functional component for therapist chat
const TherapistChat = () => {
  // Chat conversation state
  const [messages, setMessages] = useState([]);

  // Input text typed by user
  const [inputText, setInputText] = useState("");

  // Loading state while waiting for response
  const [isLoading, setIsLoading] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);

  // Selected language for interaction
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Persisted user info (e.g. pronouns, interests)
  const [userPreferences, setUserPreferences] = useState({
    interests: [],
    pronouns: "",
  });

  // Animated value for pulsing mic when recording
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Start or reset pulse animation when recording toggled
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Detects if user message contains keywords of concern
  const checkForConcerningContent = (message) => {
    const concerningKeywords = ["harm", "self-harm"];
    const lowercaseMessage = message.toLowerCase();
    const foundKeywords = concerningKeywords.filter((keyword) =>
      lowercaseMessage.includes(keyword)
    );
    if (foundKeywords.length > 0) {
      console.log("⚠️ ALERT: Concerning content detected:", {
        message,
        detectedKeywords: foundKeywords,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Parses message for interests or pronouns and updates stored preferences
  const extractUserPreferences = (message) => {
    const lowercaseMessage = message.toLowerCase();
    const clinicalInterests = [
      "anxiety",
      "depression",
      "trauma",
      "stress",
      "relationship issues",
      "ocd",
      "grief",
      "self-esteem",
      "life transitions",
      "parenting",
    ];
    const pronounPreferences = [
      "she/her",
      "he/him",
      "they/them",
      "female",
      "male",
      "non-binary",
    ];
    const detectedInterests = clinicalInterests.filter((interest) =>
      lowercaseMessage.includes(interest)
    );
    const detectedPronouns = pronounPreferences.find((pronoun) =>
      lowercaseMessage.includes(pronoun)
    );
    if (detectedInterests.length > 0 || detectedPronouns) {
      const updatedPreferences = {
        interests: [
          ...new Set([...userPreferences.interests, ...detectedInterests]),
        ],
        pronouns: detectedPronouns || userPreferences.pronouns,
      };
      setUserPreferences(updatedPreferences);
      storeUserPreferences(updatedPreferences);
    }
  };

  // Saves preferences to persistent storage
  const storeUserPreferences = async (preferences) => {
    try {
      await AsyncStorage.setItem(
        "userPreferences",
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  };

  // Load preferences from storage on initial mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const storedPreferences = await AsyncStorage.getItem("userPreferences");
        if (storedPreferences) {
          setUserPreferences(JSON.parse(storedPreferences));
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
      }
    };
    loadUserPreferences();
  }, []);

  // Sends a user message to backend and plays AI response
  const sendMessage = async (overrideText = null) => {
    const text = overrideText || inputText;
    if (!text.trim()) return;
    setIsLoading(true);

    const userMessage = { role: "user", content: text };

    // Safety + personalization checks
    checkForConcerningContent(text);
    extractUserPreferences(text);

    // Add user message to chat view
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const response = await fetch(
        "https://therapist-backend-9chu.onrender.com/api/therapist",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang: languageNames[selectedLanguage],
            messages: [...messages, userMessage],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend Error:", errorText);
        throw new Error("Backend responded with an error");
      }

      const aiReply = await response.text();

      // Strip markdown and links from raw model output
      const cleanedReply = aiReply
        .replace(/\*\*/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/\(\s*\)/g, "")
        .replace(/^###+\s*/gm, "")
        .trim();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: cleanedReply },
      ]);

      await speakWithGoogleTTS(cleanedReply);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Uses Google Cloud TTS API to convert text to audio
  const speakWithGoogleTTS = async (text) => {
    const TTS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TTS_KEY;
    console.log(
      "🔊 TTS Key Loaded:",
      process.env.EXPO_PUBLIC_GOOGLE_TTS_KEY?.slice(0, 10)
    );

    if (!TTS_API_KEY) {
      console.error("🚨 TTS API Key not found");
      return;
    }

    const voiceSettings = {
      en: { languageCode: "en-US", name: "en-US-Chirp3-HD-Achernar" },
      es: { languageCode: "es-ES", name: "es-ES-Chirp3-HD-Aoede" },
      fr: { languageCode: "fr-FR", name: "fr-FR-Chirp3-HD-Achird" },
      zh: { languageCode: "cmn-CN", name: "cmn-CN-Chirp3-HD-Achird" },
      hi: { languageCode: "hi-IN", name: "hi-IN-Chirp3-HD-Achird" },
    };

    const { languageCode, name } =
      voiceSettings[selectedLanguage] || voiceSettings.en;

    try {
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode, name },
            audioConfig: { audioEncoding: "MP3" },
          }),
        }
      );

      const result = await res.json();
      if (!result.audioContent) {
        console.error("NO audio content returned:", result);
        return;
      }

      const path = FileSystem.documentDirectory + "tts_response.mp3";
      await FileSystem.writeAsStringAsync(path, result.audioContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: path });
      await sound.playAsync();
    } catch (e) {
      console.error("TTS error:", e);
    }
  };

  // Starts microphone recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Stops recording and sends transcription to chat backend
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const uploadResult = await FileSystem.uploadAsync(
        "https://api.openai.com/v1/audio/transcriptions",
        uri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "file",
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          },
          parameters: {
            model: "whisper-1",
            response_format: "text",
            language: selectedLanguage,
          },
        }
      );

      const transcript = uploadResult.body;

      if (
        !transcript ||
        transcript.includes("error") ||
        transcript.length < 3
      ) {
        console.error(
          "🚨 Transcription failed or returned an error:",
          transcript
        );
        return;
      }

      await sendMessage(transcript);
    } catch (err) {
      console.error("Transcription error:", err);
    }
  };

  // Renders single chat message bubble
  const renderMessage = ({ item }) => (
    <View
      style={
        item.role === "user" ? styles.userMessage : styles.assistantMessage
      }
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  // Renders full UI
  return (
    <SafeAreaView style={styles.container}>
      {/* Language switcher using flags */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        {["en", "es", "fr", "zh", "hi"].map((lang) => (
          <TouchableOpacity
            key={lang}
            style={{
              marginHorizontal: 6,
              backgroundColor:
                selectedLanguage === lang ? "#196315" : "#E9E9EB",
              borderRadius: 8,
              padding: 4,
            }}
            onPress={() => setSelectedLanguage(lang)}
          >
            <Image
              source={flagIcons[lang]}
              style={{ width: 32, height: 20, borderRadius: 4 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat history */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        style={styles.messageList}
      />

      {/* Input + send + voice controls */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.sendButtonText}>...</Text>
          ) : (
            <FontAwesome name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Voice record button with animation */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                marginLeft: 10,
                backgroundColor: isRecording ? "#e74c3c" : "#2ecc71",
              },
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <MaterialIcons name="keyboard-voice" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};


export default TherapistChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  messageList: {
    flex: 1,
    marginTop: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    maxWidth: "80%",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E9E9EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
