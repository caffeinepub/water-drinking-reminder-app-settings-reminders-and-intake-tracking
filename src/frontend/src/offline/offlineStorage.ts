// Shared localStorage utilities for offline data persistence
// Provides safe JSON read/write with per-principal namespacing

export interface OfflineStorageOptions {
  version?: number;
}

const DEFAULT_VERSION = 1;

function getStorageKey(principal: string, key: string, version: number = DEFAULT_VERSION): string {
  return `offline_v${version}_${principal}_${key}`;
}

export function writeOfflineData<T>(
  principal: string,
  key: string,
  data: T,
  options: OfflineStorageOptions = {}
): void {
  try {
    const version = options.version || DEFAULT_VERSION;
    const storageKey = getStorageKey(principal, key, version);
    const serialized = JSON.stringify({
      data,
      timestamp: Date.now(),
      version,
    });
    localStorage.setItem(storageKey, serialized);
  } catch (error) {
    console.error('Failed to write offline data:', error);
  }
}

export function readOfflineData<T>(
  principal: string,
  key: string,
  options: OfflineStorageOptions = {}
): { data: T; timestamp: number } | null {
  try {
    const version = options.version || DEFAULT_VERSION;
    const storageKey = getStorageKey(principal, key, version);
    const serialized = localStorage.getItem(storageKey);
    
    if (!serialized) {
      return null;
    }
    
    const parsed = JSON.parse(serialized);
    return {
      data: parsed.data,
      timestamp: parsed.timestamp,
    };
  } catch (error) {
    console.error('Failed to read offline data:', error);
    return null;
  }
}

export function clearOfflineData(
  principal: string,
  key: string,
  options: OfflineStorageOptions = {}
): void {
  try {
    const version = options.version || DEFAULT_VERSION;
    const storageKey = getStorageKey(principal, key, version);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear offline data:', error);
  }
}

export function clearAllOfflineData(principal: string): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(`_${principal}_`)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all offline data:', error);
  }
}
