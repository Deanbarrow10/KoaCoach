import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import Anthropic from "@anthropic-ai/sdk";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const flagIcons = {
  en: require("../../assets/flags/uk.png"),
  es: require("../../assets/flags/spain.png"),
  fr: require("../../assets/flags/france.png"),
  zh: require("../../assets/flags/china.png"),
  hi: require("../../assets/flags/india.png"),
};

const languageNames = {
  en: "English",
  es: "Spanish",
  fr: "French",
  zh: "Chinese (Mandarin)",
  hi: "Hindi",
};

const TherapistChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [userPreferences, setUserPreferences] = useState({
    interests: [],
    pronouns: "",
  });

  const pulseAnim = useState(new Animated.Value(1))[0];

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

  const anthropic = new Anthropic({
    apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
  });

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

  const sendMessage = async (overrideText = null) => {
    const text = overrideText || inputText;
    if (!text.trim()) return;
    setIsLoading(true);
    const userMessage = { role: "user", content: text };
    checkForConcerningContent(text);
    extractUserPreferences(text);
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

      const aiReply = await response.text();

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
      console.error("Claude error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakWithGoogleTTS = async (text) => {
    const TTS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TTS_KEY;
    if (!TTS_API_KEY) return;

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
      if (!result.audioContent) return;

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

  const renderMessage = ({ item }) => (
    <View
      style={
        item.role === "user" ? styles.userMessage : styles.assistantMessage
      }
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  messageList: { flex: 1, padding: 16, marginTop: 10 },
  userMessage: {
    backgroundColor: "#07db78",
    alignSelf: "flex-end",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  assistantMessage: {
    backgroundColor: "#E9E9EB",
    alignSelf: "flex-start",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  messageText: { color: "#000", fontSize: 16 },
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
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#196315",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TherapistChat;
