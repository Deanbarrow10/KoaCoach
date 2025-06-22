import { Tabs } from "expo-router/tabs";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FontAwesome6 } from "@expo/vector-icons";
import { createContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export const Context = createContext(null);

export default function Layout() {
  const [exp, setExp] = useState(1);

  useEffect(() => {
    (async () => {   
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Error fetching user:", userError?.message);
      } else {
        const { data, selectUserError } = await supabase
          .from("users")
          .select("wxp")
          .eq("uid", user.id);

        if (selectUserError) {
          Alert.alert(selectUserError.message);
        } else if (data.length == 0) {
          const { addUserError } = await supabase
            .from("users")
            .insert([{ uid: user.id, wxp: 1, last_login: new Date(0) }]);

          if (addUserError) {
            console.log(addUserError.message);
          }
        } else {
          setExp(data[0].wxp);
        }
      }
    })();
  }, []);


  return (
    <Context.Provider value={{ exp, setExp }}>
      <Tabs
        screenOptions={{ tabBarActiveTintColor: "#196315", headerShown: false }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="wellness"
          options={{
            title: "Wellness",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="heart" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="therapist"
          options={{
            title: "Therapist",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome6 name="book-open-reader" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="match"
          options={{
            title: "Match",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome6 name="people-arrows" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: "Journal",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome6 name="pencil" color={color} size={size} />
            ),
          }}
        />
        
      </Tabs>
    </Context.Provider>
  );
}
