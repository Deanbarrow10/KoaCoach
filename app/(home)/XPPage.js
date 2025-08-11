import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import KoalaAnimation from "../components/KoalaAnimations";
import { getWXP, getLevel, rewardLogin, updateStreak } from "../utils/wxp";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

const unlockedAccessories = [
  { type: "hat", id: "hat1", label: "🎩 Hat", unlockLevel: 1 },
  { type: "glasses", id: "glasses1", label: "🕶️ Glasses", unlockLevel: 2 },
];

const XPPage = () => {
  const [wxp, setWXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showKart, setShowKart] = useState(false);
  const [equipped, setEquipped] = useState({});

  // adding some confetti for gaining wXP
  const [showConfetti, setShowConfetti] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const reward = await rewardLogin(); // rewards user for logging in today
        if (reward) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
        }

        const currentWXP = reward ?? (await getWXP());
        const currentLevel = Math.floor(currentWXP / 10) + 1;

        setWXP(currentWXP);
        setLevel(currentLevel);

        const s = await updateStreak?.();
        if (s !== undefined) setStreak(s);
        setEquipped(await getAccessories());
      };
      load();
    }, [])
  );

  const xpToNext = 10 - (wxp % 10);

  const handleEquip = async (type, id) => {
    await setAccessory(type, id);
    const updated = await getAccessories();
    setEquipped(updated);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Fitness XP</Text>

      {showConfetti && <Text style={styles.title}>🎉 +1 HP!</Text>}

      <KoalaAnimation type="hi" style={styles.koala} />

      <View style={styles.statsContainer}>
        <Text style={styles.level}>🏅 Level {level}</Text>
        <Text style={styles.stat}>💪 HP: {wxp}</Text>
        <Text style={styles.stat}>🔥 Streak: {streak} days</Text>

        {/* XP Progress Bar */}
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${(wxp % 10) * 10}%` }]} />
        </View>
        <Text style={styles.xpText}>{wxp % 10}/10 HP reached</Text>
      </View>

      {/* Koa Kart Unlockables */}
      <TouchableOpacity
        style={styles.kartButton}
        onPress={() => setShowKart(true)}
      >
        <Text style={styles.kartText}>🎁 View Koa Cart</Text>
      </TouchableOpacity>

      <Modal visible={showKart} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎒 Koa Cart</Text>

            {unlockedAccessories.map((acc) =>
              level >= acc.unlockLevel ? (
                <TouchableOpacity
                  key={acc.id}
                  style={styles.itemButton}
                  onPress={() => handleEquip(acc.type, acc.id)}
                >
                  <Text style={styles.itemText}>
                    {acc.label} (Level {acc.unlockLevel})
                  </Text>
                  {equipped[acc.type] === acc.id && <Text>✅ Equipped</Text>}
                </TouchableOpacity>
              ) : (
                <View key={acc.id} style={styles.lockedItem}>
                  <Text style={styles.itemText}>
                    {acc.label} (Level {acc.unlockLevel})
                  </Text>
                </View>
              )
            )}

            <TouchableOpacity
              onPress={() => setShowKart(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#f2fdf2",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1f7442",
  },
  koala: {
    width: 220,
    height: 280,
    marginBottom: 20,
  },
  statsContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  stat: {
    fontSize: 18,
    marginVertical: 4,
  },
  level: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  barBackground: {
    width: 200,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#ccc",
    marginTop: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#1f7442",
  },
  xpText: {
    fontSize: 14,
    marginTop: 4,
  },
  kartButton: {
    backgroundColor: "#1f7442",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 40,
  },
  kartText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  itemButton: {
    backgroundColor: "#eeeeee",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
  },
  lockedItem: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#ddd",
    width: "100%",
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
  },
  closeText: {
    fontSize: 16,
    color: "#1f7442",
    fontWeight: "bold",
  },
});

export default XPPage;
