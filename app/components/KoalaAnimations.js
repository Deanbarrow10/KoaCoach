import React from "react";
import { View, Image, StyleSheet } from "react-native";

// Map animation types to GIFs
const gifMap = {
  hi: require("../../assets/animations/koa-hi.gif"),
  jump: require("../../assets/animations/koa-jump.gif"),
  squat: require("../../assets/animations/koa-squat.gif"),
  wave: require("../../assets/animations/koa-wave.gif"),
};

// Default width/height per type
const defaultStyles = {
  hi: { width: 240, height: 320 },
  jump: { width: 260, height: 340 },
  squat: { width: 220, height: 300 },
  wave: { width: 250, height: 320 },
};

const KoalaAnimation = ({ type = "hi", style = {} }) => {
  const source = gifMap[type] || gifMap.hi;
  const baseStyle = defaultStyles[type] || defaultStyles.hi;

  return (
    <View style={[styles.container, style]}>
      <Image source={source} style={[baseStyle, style]} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default KoalaAnimation;
