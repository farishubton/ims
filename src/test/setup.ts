import '@testing-library/jest-dom';
import { beforeEach, afterEach } from 'vitest';
import Dexie from 'dexie';
import { IDBFactory } from 'fake-indexeddb';

global.indexedDB = new IDBFactory();

beforeEach(async () => {
  try {
    await Dexie.delete('OfflineIMS');
  } catch {
    // Database may not exist
  }
});

afterEach(async () => {
  try {
    await Dexie.delete('OfflineIMS');
  } catch {
    // Database may not exist
  }
});
