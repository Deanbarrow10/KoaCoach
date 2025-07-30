import AsyncStorage from '@react-native-async-storage/async-storage';

const XP_KEY = 'xp';
const STREAK_KEY = 'streak';
const LAST_OPEN_KEY = 'last_open';
const ACCESSORIES_KEY = 'accessories';

export const getXP = async () => {
  const xp = parseInt(await AsyncStorage.getItem(XP_KEY));
  return isNaN(xp) ? 0 : xp;
};

export const addXP = async (amount) => {
  let xp = await getXP();
  let newXP = xp + amount;
  if (newXP < 0) newXP = 0; // Clamp XP to 0 minimum
  await AsyncStorage.setItem(XP_KEY, String(newXP));
  return newXP;
};

export const getLevel = async () => {
  const xp = await getXP();
  return Math.floor(xp / 10) + 1;
};

export const updateStreak = async () => {
  const today = new Date().toDateString();
  const last = await AsyncStorage.getItem(LAST_OPEN_KEY);
  let streak = parseInt(await AsyncStorage.getItem(STREAK_KEY)) || 0;
  if (last !== today) {
    streak = last === new Date(Date.now() - 86400000).toDateString() ? streak + 1 : 1;
    await AsyncStorage.setItem(STREAK_KEY, String(streak));
    await AsyncStorage.setItem(LAST_OPEN_KEY, today);
  }
  return streak;
};

export const canReward = async (tag) => {
  const key = `rewarded_${tag}`;
  const today = new Date().toDateString();
  const last = await AsyncStorage.getItem(key);
  if (last !== today) {
    await AsyncStorage.setItem(key, today);
    return true;
  }
  return false;
};

export const getAccessories = async () => {
  const json = await AsyncStorage.getItem(ACCESSORIES_KEY);
  return json ? JSON.parse(json) : {};
};

export const toggleAccessory = async (type, name) => {
  const all = await getAccessories();
  all[type] = all[type] === name ? null : name;
  await AsyncStorage.setItem(ACCESSORIES_KEY, JSON.stringify(all));
  return all;
};

export const purchaseAccessory = async (type, name, cost) => {
  const xp = await getXP();
  const accessories = await getAccessories();

  if (xp >= cost && accessories[type] !== name) {
    await addXP(-cost);
    return toggleAccessory(type, name);
  }

  return null; // Prevent re-buying or insufficient XP
};

export default {};