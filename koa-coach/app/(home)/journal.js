import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView
} from "react-native";
import { supabase } from "../../lib/supabase";
import moment from "moment";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Context } from "../(home)/_layout";
import XpDisplay from "../../components/xp_display";

const Journal = () => {
  const { exp, setExp } = useContext(Context);
  const currDate = new Date();

  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newText, setNewText] = useState("");
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [journaledToday, setJournaledToday] = useState(false);
  const [textAreaDisabled, setTextAreaDisabled] = useState(false);

  useEffect(() => {
    (async () => {
      await fetchEntries();
    })();
  }, []);

  const fetchEntries = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError?.message);
      return;
    }

    const { data, error } = await supabase
      .from("journals")
      .select("*")
      .eq("user", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching entries:", error.message);
    else {
      setEntries(data);
      checkEntryToday(data);
    };
  };

  const checkEntryToday = (data) => {
    if (data.length != 0) {
      const newestEntryDate = new Date(data[0].created_at);

      if (currDate.getFullYear() == newestEntryDate.getFullYear() &&
          currDate.getMonth() == newestEntryDate.getMonth() &&
          currDate.getDate() == newestEntryDate.getDate()) {
        setJournaledToday(true);
        setTextAreaDisabled(true);
      }
    }
  }

  const saveEntry = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError?.message);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("Session:", session);
    console.log("User ID for insert:", user?.id);
    console.log("👤 supabase.auth.getUser() → user.id:", user?.id);
    console.log(
      "🔐 supabase.auth.getSession() → session.user.id:",
      session?.user?.id
    );

    const timestamp = currDate.toISOString();

    if (selectedEntry) {
      const { error } = await supabase
        .from("journals")
        .update({ text: newText })
        .eq("id", selectedEntry.id)
        .eq("user", user.id); // only update if user owns it

      if (error) console.error("Error updating entry:", error.message);
    } else {
      const { insertJournalError } = await supabase.from("journals").insert([
        {
          text: newText,
          created_at: timestamp,
          user: user.id,
        },
      ]);

      if (insertJournalError) console.error("Error saving entry:", insertJournalError);

      const newXp = exp + 3;

      setExp(newXp);

      const { updateXpError } = await supabase
        .from("users")
        .update({ wxp: newXp })
        .eq("uid", user.id);

      if (updateXpError) console.error("Error updating wXP:", updateXpError);
    }

    setNewText("");
    setSelectedEntry(null);
    setTextAreaDisabled(journaledToday);
    fetchEntries();
  };

  const selectEntry = (entry) => {
    setSelectedEntry(entry);
    setTextAreaDisabled(false);
    setNewText(entry.text);
  };

  const toggleDropdown = () => {
    const toValue = isDropdownOpen ? 0 : 300;
    Animated.timing(dropdownHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const renderEntryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.entryItem,
        selectedEntry?.id === item.id && styles.selectedEntry,
      ]}
      onPress={() => selectEntry(item)}
    >
      <Text style={styles.entryDate}>
        {moment(item.created_at).format("MMM D, h:mm A")}
      </Text>
      <Ionicons name="create-outline" size={18} color="#555" />
    </TouchableOpacity>
  );

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setNewText("");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.editor}>
        <View style={styles.xpDisplay}>
          <XpDisplay/>
        </View>
        <View style={styles.pastEntries}>
          <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownToggle}>
            <Ionicons
              name={isDropdownOpen ? "chevron-up" : "chevron-down"}
              size={24}
              color="#555"
            />
            <Text style={styles.dropdownLabel}>
              {isDropdownOpen ? "Hide Past Entries" : "Show Past Entries"}
            </Text>
          </TouchableOpacity>

          <Animated.View style={[styles.dropdownPanel, { height: dropdownHeight, paddingTop: isDropdownOpen ? 12 : 0 }]}>
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderEntryItem}
            />
          </Animated.View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.newEntryButton, journaledToday && { opacity: 0.5 }]}
            onPress={handleNewEntry}
            disabled={journaledToday}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={20}
              color="#196315"
            />
            <Text style={styles.newEntryText}>New Entry</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          multiline
          placeholder={textAreaDisabled ?
            "You can only make one journal entry per day. Edit a previous entry or check back tomorrow." :
            "Write your thoughts..."}
          value={newText}
          onChangeText={setNewText}
          disabled={textAreaDisabled}
        />

        <TouchableOpacity style={[styles.saveButton, textAreaDisabled && { opacity: 0.5 }]} onPress={saveEntry} disabled={textAreaDisabled}>
          <Text style={styles.saveButtonText}>
            {selectedEntry ? "Update Entry" : "Save Entry"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  xpDisplay: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom: 12
  },
  pastEntries: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
    borderColor: "#ddd",
  },
  dropdownToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#EAF8EA",
  },
  dropdownLabel: {
    marginLeft: 6,
    fontSize: 16,
    color: "#196315",
    fontWeight: "500",
  },
  dropdownPanel: {
    borderColor: "#ddd",
    overflow: "hidden",
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
  },
  entryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedEntry: {
    backgroundColor: "#DFF6DD",
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  entryDate: {
    fontSize: 14,
    color: "#333",
  },
  editor: {
    flex: 1,
    padding: 20,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  newEntryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8EA",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  newEntryText: {
    color: "#196315",
    marginLeft: 6,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    fontSize: 16,
    textAlignVertical: "top",
    borderRadius: 12,
    backgroundColor: "#fff",
    minHeight: 200,
  },
  saveButton: {
    backgroundColor: "#196315",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default Journal;
