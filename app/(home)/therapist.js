/** therapist.js defines the AI voice-based therapist chat interface for the app.
 *  it handles multilingual messaging, records voice, sends data to backend, detects safety issues,
 *  and plays AI-generated responses with Google TTS
 */

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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// added constants for google tts key
import Constants from "expo-constants";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

// maps language codes to flag images
const flagIcons = {
  en: require("../../assets/flags/uk.png"),
  es: require("../../assets/flags/spain.png"),
  fr: require("../../assets/flags/france.png"),
  zh: require("../../assets/flags/china.png"),
  hi: require("../../assets/flags/india.png"),
};

// maps language codes to display names
const languageNames = {
  en: "English",
  es: "Spanish",
  fr: "French",
  zh: "Chinese (Mandarin)",
  hi: "Hindi",
};

// stores current TTS sound
let currentTTSSound = null;

let loadingSound = null;

// backend URL
const BACKEND_URL = "https://koamigo.fly.dev";

const TherapistChat = () => {
  // manages state for chat messages and user interaction
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

  // initializes animation value for recording pulse effect
  const pulseAnim = useState(new Animated.Value(1))[0];

  // initializes audio mode
  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
      });
      console.log("🎛 Audio config initialized");
    };
    setupAudio();
  }, []);

  // animates pulse when recording is active
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

  // checks user input for concerning language
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

  // extracts therapeutic interests and pronouns from message
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

  // saves user preferences to local storage
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

  // loads user preferences when component mounts
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

  // sends message to backend and receives ai response
  const sendMessage = async (overrideText = null) => {
    const text = overrideText || inputText;
    if (!text.trim()) return;
    setIsLoading(true);
    // added loading sound and starts loop
    await playLoadingSound();
    const userMessage = { role: "user", content: text };
    checkForConcerningContent(text);
    extractUserPreferences(text);
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/therapist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: languageNames[selectedLanguage],
          messages: [...messages, userMessage],
          // handles interrupted TTS
          interrupted: currentTTSSound !== null,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Backend Error:", errorText);
        throw new Error("Backend responded with an error");
      }

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
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      // in case TTS never plays
      await stopLoadingSound();
    }
  };

  const playLoadingSound = async () => {
    try {
      if (loadingSound) {
        await loadingSound.unloadAsync();
        loadingSound = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/koa-ringtone.mp3"),
        { isLooping: true, volume: 0.3 }
      );
      loadingSound = sound;
      await sound.playAsync();
    } catch (e) {
      console.error("Error playing loading sound:", e);
    }
  };

  const stopLoadingSound = async () => {
    try {
      if (loadingSound) {
        await loadingSound.stopAsync();
        await loadingSound.unloadAsync();
        loadingSound = null;
      }
    } catch (e) {
      console.error("Error stopping loading sound:", e);
    }
  };

  // sends ai response to google tts and plays generated audio
  const speakWithGoogleTTS = async (text) => {
    // added constants for google tts key, production doesn't use env vars
    const TTS_API_KEY = Constants.expoConfig.extra.googleTTSKey;

    // ensure audio session is routed to the speaker
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

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
      console.log("Sending TTS request");
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
      console.log("📁 Saving MP3 to path:", path);

      await FileSystem.writeAsStringAsync(path, result.audioContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      try {
        const { sound } = await Audio.Sound.createAsync({ uri: path });
        // stores current TTS sound
        currentTTSSound = sound;

        // TODO: uncomment this for TTS debugging
        // sound.setOnPlaybackStatusUpdate((status) => {
        //   console.log(
        //     "[TTS Status]",
        //     status,
        //     status.isPlaying,
        //     status.positionMillis
        //   );
        // });

        // stop loading loop when TTS is about to play
        await stopLoadingSound();
        // then plays TTS
        await sound.playAsync();
        console.log("🔊 TTS played successfully");
      } catch (e) {
        console.error("TTS playback error:", e);
      }
    } catch (e) {
      console.error("TTS error:", e);
    }
  };

  // interrupts TTS if needed
  const interruptTTSIfNeeded = async () => {
    if (currentTTSSound) {
      try {
        await currentTTSSound.stopAsync();
        await currentTTSSound.unloadAsync();
        currentTTSSound = null;
        console.log("🔇 Agent interrupted");
      } catch (error) {
        console.error("TTS interruption error:", error);
      }
    }
  };

  // starts recording audio from mic
  const startRecording = async () => {
    // interrupts TTS if needed
    await interruptTTSIfNeeded();
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Microphone access is required to record audio.");
        return;
      }
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

  // stops audio recording and transcribes it using whisper
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = recording.getURI();
      const uploadResult = await FileSystem.uploadAsync(
        "https://api.openai.com/v1/audio/transcriptions",
        uri,
        {
          httpMethod: "POST",
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: "file",
          headers: {
            Authorization: `Bearer ${Constants.expoConfig.extra.openaiKey}`,
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

  // renders a single chat message bubble
  const renderMessage = ({ item }) => (
    <View
      style={
        item.role === "user" ? styles.userMessage : styles.assistantMessage
      }
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  );

  // renders the full therapist chat screen UI
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
