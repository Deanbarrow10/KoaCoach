import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { WebView } from 'react-native-webview';

// Map animation types to GIFs
const gifMap = {
  hi: require('../../assets/animations/koa-hi.gif'),
  jump: require('../../assets/animations/koa-jump.gif'),
  squat: require('../../assets/animations/koa-squat.gif'),
  wave: require('../../assets/animations/koa-wave.gif'),
};

// Default width/height per type
const defaultStyles = {
  hi: { width: 240, height: 320 },
  jump: { width: 260, height: 340 },
  squat: { width: 220, height: 300 },
  wave: { width: 250, height: 320 },
};

const KoalaAnimation = ({ type = 'hi', style = {} }) => {
  const source = gifMap[type];

  if (!source) {
    console.warn(`[KoalaAnimation] Unknown type "${type}", falling back to "hi"`);
  }

  const uri = Image.resolveAssetSource(source || gifMap.hi).uri;
  const baseStyle = defaultStyles[type] || defaultStyles.hi;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            overflow: hidden;
          }
          img {
            max-width: 90%;
            max-height: 80%;
          }
        </style>
      </head>
      <body>
        <img src="${uri}" />
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={[styles.webview, baseStyle, style]} // base + override
        scrollEnabled={false}
        bounces={false}
        backgroundColor="transparent"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});

export default KoalaAnimation;
