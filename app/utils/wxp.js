import AsyncStorage from "@react-native-async-storage/async-storage";

const WXP_KEY = "wxp";
const LAST_LOGIN_KEY = "last_login";
const LAST_JOURNAL_KEY = "last_journal";
const STREAK_KEY = "streak";

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
  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86_400_000).toDateString(); // 24 h ago

  const last = await AsyncStorage.getItem(LAST_LOGIN_KEY);
  let streak = parseInt(await AsyncStorage.getItem(STREAK_KEY));
  if (isNaN(streak)) streak = 0;

  // Only reward if we haven't logged in today
  if (last !== todayStr) {
    // 🏆 Streak logic
    if (last === yesterdayStr) {
      streak += 1; // consecutive day – increment
    } else {
      streak = 1; // missed a day – reset to 1
    }
    await AsyncStorage.setItem(STREAK_KEY, String(streak));
    await AsyncStorage.setItem(LAST_LOGIN_KEY, todayStr);

    return addWXP(1); // also returns the NEW total XP
  }
  return null; // already rewarded today
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

export const getStreak = async () => {
  const s = parseInt(await AsyncStorage.getItem(STREAK_KEY));
  return isNaN(s) ? 0 : s;
};

/** Returns the latest streak value without changing anything
 *  (rewardLogin already maintains the counter) */
export const updateStreak = async () => {
  return getStreak();
};

export default {};
