import { StorageService } from "@/types/services/storage";

export class MemoryStorageService implements StorageService {
  private storage = new Map<string, unknown>();

  getItem<T>(key: string): T | null {
    return this.storage.get(key) as T | null;
  }

  setItem<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}