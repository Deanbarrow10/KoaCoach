import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import KoalaAnimation from '../components/KoalaAnimations';
import { rewardLogin } from '../utils/wxp';

const { width, height } = Dimensions.get('window');

export default function AuthLandingPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsSignedIn(!!session);
      if (session) await rewardLogin();

      setTimeout(() => setSplashDone(true), 3000);
    };

    checkSession();
  }, []);

  // Splash animation when signed in
  if (isSignedIn && !splashDone) {
    return (
      <LinearGradient colors={['#3aa76b', '#1f7442', '#196315']} style={styles.gradient}>
        <SafeAreaView style={styles.splashContainer}>
          <KoalaAnimation type="jump" style={{ width: 280, height: 330 }} />
          <Text style={styles.splashTitle}>Koamigo</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <>
      {isSignedIn ? (
        <SafeAreaView
          style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <Text style={styles.title}>Welcome Back</Text>
        </SafeAreaView>
      ) : (
        <LinearGradient colors={['#3aa76b', '#1f7442', '#196315']} style={styles.gradient}>
          <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              <KoalaAnimation type="wave" style={styles.koala} />
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>Koamigo</Text>
              <Text style={styles.subtitle}>Hey there! I'm here to help you thrive</Text>

              <Link href="/(auth)/sign-up" style={styles.signupButton}>
                <Text style={styles.signupText}>Sign up</Text>
              </Link>
              <Link href="/(auth)/sign-in" style={styles.loginButton}>
                <Text style={styles.signupText}>Log in</Text>
              </Link>
            </View>
          </SafeAreaView>
        </LinearGradient>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  container: {
    flex: 1,
  },
  koala: {
    width: width * 0.5,
    height: height * 0.3,
    marginBottom: -70,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: 'white',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: 'white',
  },
  signupButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    marginTop: 12,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 38,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
