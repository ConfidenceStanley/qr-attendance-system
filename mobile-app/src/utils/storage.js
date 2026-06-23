import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: 'qroll_token',
  USER: 'qroll_user',
};

export const saveToken = async (token) => {
  await AsyncStorage.setItem(KEYS.TOKEN, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(KEYS.TOKEN);
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getUser = async () => {
  const user = await AsyncStorage.getItem(KEYS.USER);
  return user ? JSON.parse(user) : null;
};

export const clearStorage = async () => {
  await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
};