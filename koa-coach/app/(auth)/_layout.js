import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import { supabase } from "../../lib/supabase"; // adjust path if needed

export default function AuthRoutesLayout() {
  const [checking, setChecking] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
      setChecking(false);
    };

    checkSession();
  }, []);

  if (checking) return null; // Or show a splash/loading screen

  if (isSignedIn) {
    return <Redirect href="/(home)" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: true,
          headerBackTitle: "Back",
          title: "Log in",
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          headerShown: true,
          headerBackTitle: "Back",
          title: "Sign up",
        }}
      />
    </Stack>
  );
}
