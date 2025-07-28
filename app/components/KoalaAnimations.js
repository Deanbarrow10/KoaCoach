import React from "react";
import LottieView from "lottie-react-native";

export default function KoalaAnimation({ type, style }) {
  const sources = {
    skateboarding: require("../../assets/animations/koa-skateboarding.json"),
    meditating: require("../../assets/animations/koa-meditating.json"),
  };

  return (
    <LottieView
      source={sources[type]}
      autoPlay
      loop
      style={style}
    />
  );
}
