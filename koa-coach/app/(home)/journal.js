import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { supabase } from "../../lib/supabase";
import moment from "moment";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newText, setNewText] = useState("");
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchEntries();
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
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching entries:", error.message);
    else setEntries(data);
  };

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

    const timestamp = new Date().toISOString();

    if (selectedEntry) {
      const { error } = await supabase
        .from("journal_entries")
        .update({ text: newText })
        .eq("id", selectedEntry.id)
        .eq("user_id", user.id); // only update if user owns it

      if (error) console.error("Error updating entry:", error.message);
    } else {
      const { error } = await supabase.from("journal_entries").insert([
        {
          text: newText,
          created_at: timestamp,
          user_id: user.id,
        },
      ]);

      if (error) console.error("Error saving entry:", error.message);
    }

    setNewText("");
    setSelectedEntry(null);
    fetchEntries();
  };

  const selectEntry = (entry) => {
    setSelectedEntry(entry);
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
    <SafeAreaView style={styles.container}>
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

      <Animated.View style={[styles.dropdownPanel, { height: dropdownHeight }]}>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEntryItem}
        />
      </Animated.View>

      <View style={styles.editor}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.newEntryButton}
            onPress={handleNewEntry}
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
          placeholder="Write your thoughts..."
          value={newText}
          onChangeText={setNewText}
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
          <Text style={styles.saveButtonText}>
            {selectedEntry ? "Update Entry" : "Save Entry"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
    overflow: "hidden",
    backgroundColor: "#F5F5F7",
    borderBottomWidth: 1,
    borderColor: "#ddd",
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
