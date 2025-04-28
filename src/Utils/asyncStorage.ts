import AsyncStorage from "@react-native-async-storage/async-storage";

  
  export const getLocalStore = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value != null ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error reading value from AsyncStorage', error);
      return [];
    }
  };
  
  export const setLocalStore = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving value to AsyncStorage', error);
    }
  };