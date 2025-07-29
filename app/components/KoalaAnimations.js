import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av'; // ✅ Correct module!

const animationMap = {
  hi: require('../../assets/animations/koa-hi.mp4'),
  jump: require('../../assets/animations/koa-jump.mp4'),
  squat: require('../../assets/animations/koa-squat.mp4'),
  wave: require('../../assets/animations/koa-wave.mp4'),
};

const KoalaAnimation = ({ type = 'hi', style }) => {
  const source = animationMap[type] || animationMap.hi;

  return (
    <View style={[styles.container, style]}>
      <Video
        source={source}
        style={styles.video}
        resizeMode="contain"
        shouldPlay
        isLooping
        isMuted
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: 200,
    height: 200,
  },
});

export default KoalaAnimation;
