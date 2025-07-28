import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import KoalaAnimation from "../components/KoalaAnimations";
import { addXP, getXP, getLevel } from "../utils/xp";

export default function XPPage() {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    // Track visit and update state
    addXP("xp");
    setXP(getXP());
    setLevel(getLevel());
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your XP Progress</Text>
      <KoalaAnimation type="skateboarding" style={styles.koala} />
      <Text style={styles.text}>XP: {xp}</Text>
      <Text style={styles.text}>Level: {level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
  },
  text: {
    fontSize: 20,
    color: "#ffffff",
    marginTop: 10,
  },
  koala: {
    width: 300,
    height: 300,
  },
});
