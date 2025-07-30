import AsyncStorage from '@react-native-async-storage/async-storage';

const WXP_KEY = 'wxp';
const LAST_LOGIN_KEY = 'last_login';
const LAST_JOURNAL_KEY = 'last_journal';

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

export default {};