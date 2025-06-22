import { FontAwesome6 } from "@expo/vector-icons";
import { useContext } from "react";
import { Context } from "../app/(home)/_layout";
import { Text, View, StyleSheet } from "react-native";

const XpDisplay = () => {
  const { exp } = useContext(Context);

  return (
    <View style={styles.xpDisplay}>
        <FontAwesome6 name="star" color={"#8a670e"} size={15} />
        <Text style={styles.xpDisplayText}>{`${exp} wXP`}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    xpDisplay: {
        flexDirection: "row",
        alignSelf: "flex-start",
        backgroundColor: "#f5d95f",
        padding: 10,
        borderRadius: 50,
        gap: 8
    },
    xpDisplayText: {
        fontWeight: '700',
        color: "#8a670e"
    }
});

export default XpDisplay;