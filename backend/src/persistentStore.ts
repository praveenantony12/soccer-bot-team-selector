import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'players.json');

interface PlayerData {
  currentPlayers: string[];
  lastReset: string;
}

export class PersistentStore {
  private static instance: PersistentStore;
  private currentPlayers: string[] = [];
  private lastReset: string = '';

  private constructor() {
    this.loadData();
  }

  static getInstance(): PersistentStore {
    if (!PersistentStore.instance) {
      PersistentStore.instance = new PersistentStore();
    }
    return PersistentStore.instance;
  }

  private loadData() {
    try {
      if (existsSync(DATA_FILE)) {
        const data = readFileSync(DATA_FILE, 'utf8');
        const parsed: PlayerData = JSON.parse(data);
        this.currentPlayers = parsed.currentPlayers || [];
        this.lastReset = parsed.lastReset || '';
        
        // Check if it's a new day (reset at midnight)
        const today = new Date().toDateString();
        if (this.lastReset !== today) {
          console.log('🔄 New day detected, resetting players');
          this.clearPlayers();
          this.lastReset = today;
          this.saveData();
        }
        
        console.log('📁 Loaded persistent data:', {
          currentPlayers: this.currentPlayers.length,
          lastReset: this.lastReset
        });
      }
    } catch (error) {
      console.error('❌ Error loading persistent data:', error);
      this.currentPlayers = [];
      this.lastReset = new Date().toDateString();
    }
  }

  private saveData() {
    try {
      const data: PlayerData = {
        currentPlayers: this.currentPlayers,
        lastReset: this.lastReset
      };
      writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('💾 Saved persistent data');
    } catch (error) {
      console.error('❌ Error saving persistent data:', error);
    }
  }

  addPlayer(name: string): void {
    if (!this.currentPlayers.includes(name)) {
      this.currentPlayers.push(name);
      this.saveData();
      console.log(`➕ Player ${name} added. Total: ${this.currentPlayers.length}`);
    }
  }

  removePlayer(name: string): void {
    this.currentPlayers = this.currentPlayers.filter(p => p !== name);
    this.saveData();
    console.log(`➖ Player ${name} removed. Total: ${this.currentPlayers.length}`);
  }

  getPlayers(): string[] {
    return [...this.currentPlayers];
  }

  clearPlayers(): void {
    this.currentPlayers = [];
    this.lastReset = new Date().toDateString();
    this.saveData();
    console.log('🗑️ Players cleared for new day');
  }

  getPlayerCount(): number {
    return this.currentPlayers.length;
  }
}

// Export singleton instance
export const persistentStore = PersistentStore.getInstance();
