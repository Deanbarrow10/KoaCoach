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
  const [entries, setEntries] = useState([]); // all journal entries
  const [selectedEntry, setSelectedEntry] = useState(null); // currently selected entry for editing
  const [newText, setNewText] = useState(""); // text for new or edited entry
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchEntries(); // fetch entries on mount
  }, []);

  // Fetch journal entries for current user
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

  // Save or update journal entry
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

    const timestamp = new Date().toISOString();

    if (selectedEntry) {
      // Update existing entry
      const { error } = await supabase
        .from("journal_entries")
        .update({ text: newText })
        .eq("id", selectedEntry.id)
        .eq("user_id", user.id); // ensure user owns entry

      if (error) console.error("Error updating entry:", error.message);
    } else {
      // Insert new entry
      const { error } = await supabase.from("journal_entries").insert([
        {
          text: newText,
          created_at: timestamp,
          user_id: user.id,
        },
      ]);

      if (error) console.error("Error saving entry:", error.message);
    }

    // Reset state after save
    setNewText("");
    setSelectedEntry(null);
    fetchEntries();
  };

  // Load entry content into editor
  const selectEntry = (entry) => {
    setSelectedEntry(entry);
    setNewText(entry.text);
  };

  // Toggle dropdown animation for past entries
  const toggleDropdown = () => {
    const toValue = isDropdownOpen ? 0 : 300;
    Animated.timing(dropdownHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Render individual journal entry preview
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

  // Clear editor for new entry
  const handleNewEntry = () => {
    setSelectedEntry(null);
    setNewText("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Toggle for dropdown list of past entries */}
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

      {/* Animated dropdown panel */}
      <Animated.View style={[styles.dropdownPanel, { height: dropdownHeight }]}>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEntryItem}
        />
      </Animated.View>

      {/* Entry editor UI */}
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

export default Journal;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  entry: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  entryText: {
    fontSize: 16,
    color: "#333",
  },
});
