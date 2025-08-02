import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import KoalaAnimation from '../components/KoalaAnimations';
import {
  getWXP,
  getLevel,
  getUnlockedPuzzles,
  markPuzzleCompleted,
} from '../utils/wxp';
import {
  getStreak,
  updateStreak,
  getAccessories,
  setAccessory,
} from '../utils/xp';

const { height } = Dimensions.get('window');

const unlockedAccessories = [
  { type: 'hat', id: 'hat1', label: '🎩 Hat', unlockLevel: 1 },
  { type: 'glasses', id: 'glasses1', label: '🕶️ Glasses', unlockLevel: 2 },
];

const XPPage = () => {
  const [wxp, setWXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showKart, setShowKart] = useState(false);
  const [equipped, setEquipped] = useState({});
  const [showPuzzles, setShowPuzzles] = useState(false);
  const [showBreathPuzzle, setShowBreathPuzzle] = useState(false);
  const [showMoodMatcher, setShowMoodMatcher] = useState(false);
  const [puzzleList, setPuzzleList] = useState([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const load = async () => {
      const w = await getWXP();
      const l = await getLevel();
      const s = await updateStreak();
      setWXP(w);
      setLevel(l);
      setStreak(s);
      setEquipped(await getAccessories());
      const puzzles = await getUnlockedPuzzles();
      setPuzzleList(puzzles);
    };
    load();
  }, []);

  useEffect(() => {
    if (showBreathPuzzle) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showBreathPuzzle]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -30,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -30) setShowPuzzles(true);
      },
    })
  ).current;

  const xpToNext = 10 - (wxp % 10);

  const handleEquip = async (type, id) => {
    await setAccessory(type, id);
    const updated = await getAccessories();
    setEquipped(updated);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} {...panResponder.panHandlers}>
      <Text style={styles.title}>Your Wellness XP</Text>

      <KoalaAnimation type="hi" style={styles.koala} />

      <View style={styles.statsContainer}>
        <Text style={styles.level}>🏅 Level {level}</Text>
        <Text style={styles.stat}>🌿 wXP: {wxp}</Text>
        <Text style={styles.stat}>🔥 Streak: {streak} days</Text>

        {/* XP Progress Bar */}
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${(wxp % 10) * 10}%` }]} />
        </View>
        <Text style={styles.xpText}>{wxp % 10}/10 to next level</Text>
      </View>

      {/* Koa Kart Unlockables */}
      <TouchableOpacity style={styles.kartButton} onPress={() => setShowKart(true)}>
        <Text style={styles.kartText}>🎁 View Unlocked Items</Text>
      </TouchableOpacity>

      <Modal visible={showKart} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎒 Koa Unlockables</Text>

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
                    🔒 {acc.label} (Unlocks at Level {acc.unlockLevel})
                  </Text>
                </View>
              )
            )}

            <TouchableOpacity onPress={() => setShowKart(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Swipe Arrow */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 22 }}>⬆️</Text>
      </View>

      {/* Puzzle Modal */}
      <Modal visible={showPuzzles} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'white', padding: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>🧩 Puzzles</Text>
          {puzzleList.map((puzzle) => (
            <TouchableOpacity
              key={puzzle.id}
              disabled={!puzzle.unlocked}
              style={{
                backgroundColor: puzzle.unlocked ? '#e0ffe0' : '#ddd',
                padding: 16,
                borderRadius: 10,
                marginBottom: 14,
              }}
              onPress={() => {
                if (puzzle.id === 'breath_rhythm') setShowBreathPuzzle(true);
                else if (puzzle.id === 'mood_matcher') setShowMoodMatcher(true);
              }}
            >
              <Text style={{ fontSize: 18 }}>{puzzle.title} {puzzle.completed ? '✅' : ''}</Text>
              <Text>{puzzle.description}</Text>
              {!puzzle.unlocked && <Text>🔒 Unlocks at Level {puzzle.levelRequired}</Text>}
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setShowPuzzles(false)}>
            <Text style={{ marginTop: 20, fontWeight: 'bold', color: '#1f7442' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Breath Rhythm Puzzle */}
      <Modal visible={showBreathPuzzle} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: '#f0fff0', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginBottom: 40 }}>🌬️ Breath Rhythm</Text>
          <Animated.View
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: '#a3d9a5',
              transform: [{ scale: scaleAnim }],
              marginBottom: 30,
            }}
          />
          <TouchableOpacity
            onPress={async () => {
              await markPuzzleCompleted("breath_rhythm");
              setShowBreathPuzzle(false);
              setShowPuzzles(false);
              const puzzles = await getUnlockedPuzzles();
              setPuzzleList(puzzles);
            }}
            style={{ backgroundColor: '#1f7442', padding: 14, borderRadius: 10 }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>✅ I Completed It</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Mood Matcher Puzzle */}
      <Modal visible={showMoodMatcher} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: '#fffaf0', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 22, marginBottom: 20 }}>🧠 Mood Matcher</Text>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Match the emoji to the correct emotion!</Text>

          {/* Example emoji: 😀 = Happy */}
          <TouchableOpacity
            style={{ backgroundColor: '#e0ffe0', padding: 20, borderRadius: 12, margin: 10 }}
            onPress={async () => {
              setShowMoodMatcher(false);
              setShowPuzzles(false);
              await markPuzzleCompleted("mood_matcher");
              const puzzles = await getUnlockedPuzzles();
              setPuzzleList(puzzles);
              // optionally trigger Koa jump animation
            }}
          >
            <Text style={{ fontSize: 20 }}>😀 = Happy ✅</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#f2fdf2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f7442',
  },
  koala: {
    width: 220,
    height: 280,
    marginBottom: 20,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stat: {
    fontSize: 18,
    marginVertical: 4,
  },
  level: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  barBackground: {
    width: 200,
    height: 16,
    borderRadius: 10,
    backgroundColor: '#ccc',
    marginTop: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#1f7442',
  },
  xpText: {
    fontSize: 14,
    marginTop: 4,
  },
  kartButton: {
    backgroundColor: '#1f7442',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 40,
  },
  kartText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemButton: {
    backgroundColor: '#eeeeee',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  lockedItem: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
  },
  closeText: {
    fontSize: 16,
    color: '#1f7442',
    fontWeight: 'bold',
  },
});

export default XPPage;
