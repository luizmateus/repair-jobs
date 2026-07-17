import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

export const asyncPersistStorage = createJSONStorage(() => ({
  getItem: async (name) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.error(`[persist] getItem failed for "${name}"`, error);
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error(`[persist] setItem failed for "${name}"`, error);
      throw error;
    }
  },
  removeItem: async (name) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error(`[persist] removeItem failed for "${name}"`, error);
      throw error;
    }
  },
}));
