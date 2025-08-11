// app/(tabs)/Calories.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Haptics from "expo-haptics";
import { supabase } from "../../lib/supabase";

const GREEN = "#196315";
// on simulator, localhost works; on a real device use your Mac's LAN IP (e.g., http://192.168.1.42:5001)
const BACKEND_URL = "http://localhost:5001";

export default function CaloriesScreen() {
  const camRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [todayLogs, setTodayLogs] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);

  const [previewUri, setPreviewUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [servingGrams, setServingGrams] = useState("");

  const [showScanner, setShowScanner] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        await requestPermission(); // asks for camera permission
      }
    })();
    fetchToday(); // loads today's logs
  }, [permission]);

  const localToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  async function fetchToday() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("nutrition_logs")
        .select("id, food, calories, serving_grams")
        .eq("user_id", user.id)
        .eq("logged_on", localToday())
        .order("created_at", { ascending: false });

      if (error) throw error;
      const rows = data || [];
      setTodayLogs(rows);
      setTodayTotal(rows.reduce((s, r) => s + Number(r.calories || 0), 0));
    } catch (e) {
      console.log("fetchToday error:", e);
    }
  }

  async function openScanner() {
    if (permission && !permission.granted) {
      Alert.alert("camera permission", "please enable camera in settings.");
      return;
    }
    setOptions([]);
    setSelected(null);
    setServingGrams("");
    setPreviewUri(null);
    setShowScanner(true);
  }

  // analyze a local image uri (camera capture OR library pick)
  async function analyzeUri(uri) {
    try {
      setAnalyzing(true);
      const manip = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      setPreviewUri(manip.uri);

      const res = await fetch(`${BACKEND_URL}/api/analyze-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: manip.base64 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "analyze failed");

      const opts = (json.options || []).slice(0, 3);
      if (!opts.length) {
        setShowOptions(false);
        setShowScanner(false);
        Alert.alert(
          "No result",
          "Couldn’t recognize that meal. Try a clearer photo or pick another.",
          [
            { text: "Pick another", onPress: () => pickFromLibrary() },
            { text: "Close", style: "cancel" },
          ]
        );
        return;
      }

      setOptions(opts);
      setSelected(opts[0]);
      setServingGrams(String(opts[0].serving_grams || ""));
      setShowOptions(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.log("analyze error:", e);
      setShowOptions(false);
      setShowScanner(false);
      Alert.alert(
        "Scan failed",
        "Try better lighting or get closer to the dish."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function takePhotoAndAnalyze() {
    if (!camRef.current) return;
    const shot = await camRef.current.takePictureAsync({
      quality: 0.9,
      base64: false,
      skipProcessing: true,
    });
    await analyzeUri(shot.uri);
  }

  // dev helper for simulator
  async function pickFromLibrary() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Image],
      quality: 1,
      base64: false,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      await analyzeUri(res.assets[0].uri);
      setShowScanner(true); // show preview + controls
    }
  }

  function scaledCalories(opt, gramsStr) {
    const grams = Number(gramsStr);
    if (!opt || !grams || !opt.serving_grams || !opt.calories)
      return opt?.calories || 0;
    const perGram = Number(opt.calories) / Number(opt.serving_grams);
    return Math.round(perGram * grams);
  }

  async function addToToday() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("sign in required", "please log in to save meals.");
        return;
      }
      if (!selected) {
        Alert.alert("choose result", "select one of the options first.");
        return;
      }

      const gramsNum = servingGrams
        ? Number(servingGrams)
        : selected.serving_grams || null;
      const kcal = gramsNum
        ? scaledCalories(selected, String(gramsNum))
        : Math.round(selected.calories);

      const { error } = await supabase.from("nutrition_logs").insert({
        user_id: user.id,
        logged_on: localToday(),
        food: selected.label,
        serving_grams: gramsNum,
        calories: kcal,
        protein: selected.protein ?? null,
        carbs: selected.carbs ?? null,
        fat: selected.fat ?? null,
        photo_url: previewUri,
        source: selected,
      });
      if (error) throw error;

      // optimistic ui
      setTodayLogs((prev) => [
        {
          id: Math.random().toString(),
          food: selected.label,
          calories: kcal,
          serving_grams: gramsNum || null,
        },
        ...prev,
      ]);
      setTodayTotal((prev) => prev + kcal);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowOptions(false);
      setShowScanner(false);
    } catch (e) {
      console.log("save log error:", e);
      Alert.alert("couldn’t save", "please try again.");
    }
  }

  const renderLog = ({ item }) => (
    <View style={styles.logCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.logTitle}>{item.food}</Text>
        <Text style={styles.logSub}>
          {item.serving_grams ? `${item.serving_grams} g • ` : ""}
          {Math.round(item.calories)} kcal
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* header matches your home style */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Today</Text>
        <Text style={styles.appName}>Calories</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Calories</Text>
          <Text style={styles.totalValue}>{todayTotal}</Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={openScanner}>
          <Text style={styles.startButtonText}>Scan Meal</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: "#2d6a4f", marginTop: 10 },
            ]}
            onPress={pickFromLibrary}
          >
            <Text style={styles.startButtonText}>Pick from Library</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {todayLogs.length === 0 ? (
          <Text style={styles.empty}>No meals yet. Tap "Scan Meal"</Text>
        ) : (
          <FlatList
            data={todayLogs}
            keyExtractor={(item) => item.id}
            renderItem={renderLog}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>

      {/* camera / preview modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{ flex: 1, resizeMode: "cover" }}
            />
          ) : permission?.granted ? (
            <CameraView ref={camRef} style={{ flex: 1 }} facing="back" mute />
          ) : (
            <View style={styles.center}>
              <Text style={{ color: "#fff" }}>Camera permission needed</Text>
            </View>
          )}

          <View style={styles.bottomSheet}>
            {!previewUri ? (
              <TouchableOpacity
                style={styles.captureBtn}
                onPress={takePhotoAndAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>capture</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => {
                  setPreviewUri(null);
                  setOptions([]);
                  setSelected(null);
                }}
              >
                <Text style={styles.secondaryText}>retake</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.secondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* options modal */}
      <Modal
        visible={showOptions}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
        transparent
      >
        <View style={styles.overlay}>
          <View style={styles.optionsCard}>
            {/* small header with close */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <View style={{ width: 24 }} />
              <Text style={styles.optionsTitle}>Choose Result</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false);
                  setShowScanner(false);
                }}
              >
                <Text style={{ color: "#bbb" }}>Close</Text>
              </TouchableOpacity>
            </View>

            {options.length === 0 ? (
              <>
                <Text style={styles.dim}>No results. Try again.</Text>
                <TouchableOpacity
                  style={[styles.saveBtn, { marginTop: 12 }]}
                  onPress={() => {
                    setShowOptions(false);
                    setShowScanner(false);
                  }}
                >
                  <Text style={styles.btnText}>close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    setShowOptions(false);
                    pickFromLibrary();
                  }}
                >
                  <Text style={styles.secondaryText}>Pick Another Photo</Text>
                </TouchableOpacity>
              </>
            ) : (
              options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.optionRow,
                    selected?.label === opt.label && styles.optionRowSelected,
                  ]}
                  onPress={() => {
                    setSelected(opt);
                    setServingGrams(String(opt.serving_grams || ""));
                  }}
                >
                  <Text style={styles.optionTitle}>{opt.label}</Text>
                  <Text style={styles.optionMeta}>
                    {opt.serving} • ~{Math.round(opt.calories)} kcal •{" "}
                    {Math.round((opt.confidence || 0) * 100)}%
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {selected && options.length > 0 && (
              <>
                <Text style={styles.inputLabel}>Serving (grams)</Text>
                <TextInput
                  value={servingGrams}
                  onChangeText={setServingGrams}
                  keyboardType="numeric"
                  placeholder="e.g., 150"
                  placeholderTextColor="#888"
                  style={styles.input}
                />
                <Text style={styles.previewKcal}>
                  Will log ~
                  {scaledCalories(
                    selected,
                    servingGrams || String(selected.serving_grams || 0)
                  )}{" "}
                  kcal
                </Text>
                <TouchableOpacity style={styles.saveBtn} onPress={addToToday}>
                  <Text style={styles.btnText}>Add to Today</Text>
                </TouchableOpacity>
                <Text style={styles.disclaimer}>
                  Estimates only. Not medical advice.
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    flexDirection: "column",
  },
  welcomeText: { fontSize: 24, color: "#333" },
  appName: { fontSize: 32, fontWeight: "bold", color: GREEN, marginTop: 5 },

  cardContainer: { padding: 20 },
  totalCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: { fontSize: 16, color: "#666" },
  totalValue: { fontSize: 40, fontWeight: "bold", color: GREEN, marginTop: 6 },

  startButton: {
    backgroundColor: GREEN,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: GREEN,
    marginTop: 24,
    marginBottom: 10,
  },
  empty: { color: "#666" },

  logCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  logTitle: { fontSize: 16, fontWeight: "600", color: "#222" },
  logSub: { fontSize: 14, color: "#666", marginTop: 2 },

  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#111",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  captureBtn: {
    flex: 1,
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
    flex: 1,
  },
  closeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  secondaryText: { color: "#bbb" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  optionsCard: {
    backgroundColor: "#111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "70%",
  },
  optionsTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dim: { color: "#aaa", marginTop: 8 },
  optionRow: {
    backgroundColor: "#1A1A1A",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  optionRowSelected: { borderColor: GREEN },
  optionTitle: { color: "#fff", fontWeight: "600" },
  optionMeta: { color: "#ccc", marginTop: 2, fontSize: 12 },

  inputLabel: { color: "#ddd", marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: "#171717",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  previewKcal: { color: "#ddd", marginTop: 6, fontWeight: "600" },
  disclaimer: { color: "#777", marginTop: 8, fontSize: 12 },
});
