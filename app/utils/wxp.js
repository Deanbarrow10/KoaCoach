import AsyncStorage from '@react-native-async-storage/async-storage';

const WXP_KEY = 'wxp';
const LAST_LOGIN_KEY = 'last_login';
const LAST_JOURNAL_KEY = 'last_journal';
//////////////////////////////////////////////////////
const PUZZLES = [
  {
    id: "mood_matcher",
    title: "Mood Matcher",
    description: "Match emojis to the correct emotions!",
    levelRequired: 1,
  },
  {
    id: "breath_rhythm",
    title: "Breath Rhythm",
    description: "Follow the breathing pattern to relax.",
    levelRequired: 2,
  },
];
//////////////////////////////////////////////////////


export const getWXP = async () => {
  const val = parseInt(await AsyncStorage.getItem(WXP_KEY));
  return isNaN(val) ? 0 : val;
};

export const addWXP = async (amount) => {
  const curr = await getWXP();
  const next = Math.max(curr + amount, 0);
  await AsyncStorage.setItem(WXP_KEY, String(next));
  return next;
};

export const rewardLogin = async () => {
  const today = new Date().toDateString();
  const last = await AsyncStorage.getItem(LAST_LOGIN_KEY);
  if (last !== today) {
    await AsyncStorage.setItem(LAST_LOGIN_KEY, today);
    return addWXP(1);
  }
  return null;
};

export const rewardJournal = async () => {
  const today = new Date().toDateString();
  const last = await AsyncStorage.getItem(LAST_JOURNAL_KEY);
  if (last !== today) {
    await AsyncStorage.setItem(LAST_JOURNAL_KEY, today);
    return addWXP(2);
  }
  return null;
};

export const getLevel = async () => {
  const wxp = await getWXP();
  return Math.floor(wxp / 10) + 1;
};

const PUZZLES_KEY = "completed_puzzles";

export const getCompletedPuzzles = async () => {
  const raw = await AsyncStorage.getItem(PUZZLES_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const markPuzzleCompleted = async (id) => {
  const completed = await getCompletedPuzzles();
  if (!completed.includes(id)) {
    completed.push(id);
    await AsyncStorage.setItem(PUZZLES_KEY, JSON.stringify(completed));
  }
};

export const isPuzzleCompleted = async (id) => {
  const completed = await getCompletedPuzzles();
  return completed.includes(id);
};

export const getUnlockedPuzzles = async () => {
  const xp = await getWXP();
  const level = Math.floor(xp / 10) + 1;
  const done = await getCompletedPuzzles();

  return PUZZLES.map(p => ({
    ...p,
    unlocked: level >= p.levelRequired,
    completed: done.includes(p.id),
  }));
};


export default {};