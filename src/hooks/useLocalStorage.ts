import { useState } from 'react';

// A custom hook to synchronize state with localStorage.
// This encapsulates the logic for reading, writing, and handling potential errors.
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            if (item === null) { // Explicitly check for no item
                return initialValue;
            }
            const parsed = JSON.parse(item);
            // If the stored value is null but the initial value is not, it's likely a storage corruption.
            // Fallback to initial value to prevent runtime errors (e.g., Object.entries(null)).
            if (parsed === null && initialValue !== null) {
                return initialValue;
            }
            return parsed;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            // Using the functional update form of useState ensures we always have the latest state.
            setStoredValue((prevValue) => {
                const valueToStore = value instanceof Function ? value(prevValue) : value;
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    };

    return [storedValue, setValue];
}
