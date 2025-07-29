import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import KoalaAnimation from '../components/KoalaAnimations';
import {
  getXP,
  addXP,
  getStreak,
  updateStreak,
  getLevel,
  getAccessories,
  setAccessory,
} from '../utils/xp';

const accessoriesList = [
  { type: 'hat', id: 'hat1', label: '🎩 Hat', cost: 10 },
  { type: 'glasses', id: 'glasses1', label: '🕶️ Glasses', cost: 15 },
  { type: 'shoes', id: 'shoes1', label: '👟 Shoes', cost: 20 },
];

const XPPage = () => {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showKart, setShowKart] = useState(false);
  const [equipped, setEquipped] = useState({});

  useEffect(() => {
    const load = async () => {
      setXP(await getXP());
      setLevel(await getLevel());
      setStreak(await getStreak());
      setEquipped(await getAccessories());
    };
    load();
  }, []);

  const handleEquip = async (type, id, cost) => {
    if (xp >= cost) {
      await addXP(-cost);
      await setAccessory(type, id);
      const updated = await getAccessories();
      setEquipped(updated);
      setXP(await getXP());
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>XP & Level</Text>
      <Text style={styles.stat}>XP: {xp}</Text>
      <Text style={styles.stat}>Level: {level}</Text>
      <Text style={styles.streak}>🔥 Streak: {streak} days</Text>

      <KoalaAnimation type="wave" style={styles.koala} />

      <TouchableOpacity style={styles.kartButton} onPress={() => setShowKart(true)}>
        <Text style={styles.kartText}>Koa Kart</Text>
      </TouchableOpacity>

      {/* Koa Kart Modal */}
      <Modal visible={showKart} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎒 Koa Kart</Text>

            {accessoriesList.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={styles.itemButton}
                onPress={() => handleEquip(acc.type, acc.id, acc.cost)}
              >
                <Text style={styles.itemText}>
                  {acc.label} – {acc.cost} XP
                </Text>
                {equipped[acc.type] === acc.id && <Text>✅ Equipped</Text>}
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setShowKart(false)} style={styles.closeButton}>
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
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stat: {
    fontSize: 16,
    marginBottom: 4,
  },
  streak: {
    fontSize: 16,
    marginBottom: 20,
  },
  koala: {
    marginBottom: 20,
  },
  kartButton: {
    backgroundColor: '#228B22',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 30,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
  },
  closeText: {
    fontSize: 16,
    color: '#228B22',
    fontWeight: 'bold',
  },
});

export default XPPage;
