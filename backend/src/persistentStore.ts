import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'players.json');

interface PlayerData {
  currentPlayers: string[];
  lastReset: string;
  formedTeams?: any;
  dailyStatus?: 'collecting' | 'formed' | 'insufficient';
  lastProcessedDate?: string;
}

export class PersistentStore {
  private static instance: PersistentStore;
  private currentPlayers: string[] = [];
  private lastReset: string = '';
  private formedTeams: any = null;
  private dailyStatus: 'collecting' | 'formed' | 'insufficient' = 'collecting';
  private lastProcessedDate: string = '';

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
      // Try file storage first
      if (existsSync(DATA_FILE)) {
        const data = readFileSync(DATA_FILE, 'utf8');
        const parsed: PlayerData = JSON.parse(data);
        this.currentPlayers = parsed.currentPlayers || [];
        this.lastReset = parsed.lastReset || '';
        this.formedTeams = parsed.formedTeams || null;
        this.dailyStatus = parsed.dailyStatus || 'collecting';
        this.lastProcessedDate = parsed.lastProcessedDate || '';
        console.log('📁 Loaded persistent data from file');
      } else {
        console.log('📁 No data file found, using env backup');
      }
    } catch (error) {
      console.error('📁 Error loading data file, trying env backup:', error);
    }

    // Backup: Load from environment variables (for Render's ephemeral storage)
    try {
      const envPlayers = process.env.PERSISTENT_PLAYERS;
      const envLastReset = process.env.PERSISTENT_LAST_RESET;
      const envStatus = process.env.PERSISTENT_STATUS;
      const envTeams = process.env.PERSISTENT_TEAMS;

      if (envPlayers && this.currentPlayers.length === 0) {
        this.currentPlayers = JSON.parse(envPlayers);
        this.lastReset = envLastReset || this.getTodayKey();
        this.dailyStatus = (envStatus as any) || 'collecting';
        this.formedTeams = envTeams ? JSON.parse(envTeams) : null;
        this.lastProcessedDate = process.env.PERSISTENT_PROCESSED_DATE || '';
        console.log('🔄 Loaded persistent data from environment variables');
      }
    } catch (error) {
      console.error('� Error loading env backup:', error);
    }
    
    // Check if it's a new day (reset at midnight)
    const today = this.getTodayKey();
    if (this.lastReset !== today) {
      console.log('🔄 New day detected, resetting players and teams');
      this.currentPlayers = [];
      this.formedTeams = null;
      this.dailyStatus = 'collecting';
      this.lastProcessedDate = '';
      this.lastReset = today;
      this.saveData();
    }
  }

  private saveData() {
    try {
      const data: PlayerData = {
        currentPlayers: this.currentPlayers,
        lastReset: this.lastReset,
        formedTeams: this.formedTeams,
        dailyStatus: this.dailyStatus,
        lastProcessedDate: this.lastProcessedDate
      };
      
      // Save to file (for local development)
      writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('💾 Saved persistent data to file');
      
      // Backup: Save to environment variables (for Render's ephemeral storage)
      // Note: This only works if the environment allows setting env vars at runtime
      try {
        process.env.PERSISTENT_PLAYERS = JSON.stringify(this.currentPlayers);
        process.env.PERSISTENT_LAST_RESET = this.lastReset;
        process.env.PERSISTENT_STATUS = this.dailyStatus;
        process.env.PERSISTENT_TEAMS = JSON.stringify(this.formedTeams);
        process.env.PERSISTENT_PROCESSED_DATE = this.lastProcessedDate;
        console.log('💾 Saved persistent data to environment variables');
      } catch (envError) {
        console.log('⚠️ Could not save to environment variables (expected on some platforms)');
      }
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
    this.lastReset = this.getTodayKey();
    this.saveData();
    console.log('🗑️ Players cleared');
  }

  saveTeams(teams: any): void {
    this.formedTeams = teams;
    this.dailyStatus = 'formed';
    this.lastProcessedDate = this.getTodayKey();
    this.saveData();
    console.log('🏆 Teams saved to persistent store');
  }

  getFormedTeams(): any {
    return this.formedTeams;
  }

  getPlayerCount(): number {
    return this.currentPlayers.length;
  }

  markInsufficient(): void {
    this.dailyStatus = 'insufficient';
    this.formedTeams = null;
    this.lastProcessedDate = this.getTodayKey();
    this.saveData();
  }

  setDailyStatus(status: 'collecting' | 'formed' | 'insufficient'): void {
    this.dailyStatus = status;
    this.saveData();
  }

  getDailyStatus(): 'collecting' | 'formed' | 'insufficient' {
    return this.dailyStatus;
  }

  getLastProcessedDate(): string {
    return this.lastProcessedDate;
  }

  hasProcessedToday(): boolean {
    return this.lastProcessedDate === this.getTodayKey();
  }

  getLastResetKey(): string {
    return this.lastReset;
  }

  resetForNewDay(): void {
    this.currentPlayers = [];
    this.formedTeams = null;
    this.dailyStatus = 'collecting';
    this.lastProcessedDate = '';
    this.lastReset = this.getTodayKey();
    this.saveData();
  }

  getTodayKey(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: process.env.TEAM_TIMEZONE || 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }
}

// Export singleton instance
export const persistentStore = PersistentStore.getInstance();
