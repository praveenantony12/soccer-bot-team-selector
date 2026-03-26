import { Db, getMongoDb } from './mongodb';

interface DailyData {
  date: string; // Format: YYYY-MM-DD
  currentPlayers: string[];
  lastReset: string;
  formedTeams: any;
  dailyStatus: 'collecting' | 'formed' | 'insufficient';
  lastProcessedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

class MongoPersistentStore {
  private static instance: MongoPersistentStore;
  private db: Db | null = null;

  static getInstance(): MongoPersistentStore {
    if (!MongoPersistentStore.instance) {
      MongoPersistentStore.instance = new MongoPersistentStore();
    }
    return MongoPersistentStore.instance;
  }

  private constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      this.db = await getMongoDb();
      console.log('🗃️ MongoDB Persistent Store initialized');
    } catch (error) {
      console.error('❌ Failed to initialize MongoDB Persistent Store:', error);
      // Fallback to in-memory storage for development
      this.db = null;
    }
  }

  private async getCollection() {
    if (!this.db) {
      this.db = await getMongoDb();
    }
    return this.db!.collection<DailyData>('daily_data');
  }

  private getTodayKey(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: process.env.TEAM_TIMEZONE || 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }

  async loadData(): Promise<DailyData | null> {
    try {
      const collection = await this.getCollection();
      const today = this.getTodayKey();
      
      const data = await collection.findOne({ date: today });
      
      if (data) {
        console.log('📁 Loaded persistent data from MongoDB');
        return data;
      } else {
        console.log('📁 No data found for today, creating new entry');
        return await this.createNewDay();
      }
    } catch (error) {
      console.error('❌ Error loading data from MongoDB:', error);
      // Fallback to empty state
      return await this.createNewDay();
    }
  }

  private async createNewDay(): Promise<DailyData> {
    const today = this.getTodayKey();
    const newData: DailyData = {
      date: today,
      currentPlayers: [],
      lastReset: today,
      formedTeams: null,
      dailyStatus: 'collecting',
      lastProcessedDate: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const collection = await this.getCollection();
      await collection.insertOne(newData);
      console.log('🆕 Created new daily data entry');
    } catch (error) {
      console.error('❌ Error creating new daily data:', error);
    }

    return newData;
  }

  async saveData(data: Partial<DailyData>): Promise<void> {
    try {
      const collection = await this.getCollection();
      const today = this.getTodayKey();
      
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      await collection.updateOne(
        { date: today },
        { $set: updateData },
        { upsert: true }
      );
      
      console.log('💾 Saved persistent data to MongoDB');
    } catch (error) {
      console.error('❌ Error saving data to MongoDB:', error);
    }
  }

  async getPlayers(): Promise<string[]> {
    const data = await this.loadData();
    return data?.currentPlayers || [];
  }

  async addPlayer(name: string): Promise<void> {
    const data = await this.loadData();
    if (data && !data.currentPlayers.includes(name)) {
      data.currentPlayers.push(name);
      await this.saveData({ currentPlayers: data.currentPlayers });
      console.log(`➕ Player ${name} added. Total: ${data.currentPlayers.length}`);
    }
  }

  async removePlayer(name: string): Promise<void> {
    const data = await this.loadData();
    if (data) {
      data.currentPlayers = data.currentPlayers.filter(p => p !== name);
      await this.saveData({ currentPlayers: data.currentPlayers });
      console.log(`➖ Player ${name} removed. Total: ${data.currentPlayers.length}`);
    }
  }

  async clearPlayers(): Promise<void> {
    const data = await this.loadData();
    if (data) {
      data.currentPlayers = [];
      data.lastReset = this.getTodayKey();
      await this.saveData({ currentPlayers: data.currentPlayers, lastReset: data.lastReset });
      console.log('🗑️ Players cleared');
    }
  }

  async getPlayerCount(): Promise<number> {
    const players = await this.getPlayers();
    return players.length;
  }

  async getFormedTeams(): Promise<any> {
    const data = await this.loadData();
    return data?.formedTeams;
  }

  async saveTeams(teams: any): Promise<void> {
    const data = await this.loadData();
    if (data) {
      data.formedTeams = teams;
      data.dailyStatus = 'formed';
      data.lastProcessedDate = this.getTodayKey();
      await this.saveData({ 
        formedTeams: teams, 
        dailyStatus: data.dailyStatus, 
        lastProcessedDate: data.lastProcessedDate 
      });
      console.log('🏆 Teams saved to MongoDB');
    }
  }

  async getDailyStatus(): Promise<'collecting' | 'formed' | 'insufficient'> {
    const data = await this.loadData();
    return data?.dailyStatus || 'collecting';
  }

  async setDailyStatus(status: 'collecting' | 'formed' | 'insufficient'): Promise<void> {
    const data = await this.loadData();
    if (data) {
      data.dailyStatus = status;
      data.lastProcessedDate = this.getTodayKey();
      await this.saveData({ 
        dailyStatus: status, 
        lastProcessedDate: data.lastProcessedDate 
      });
    }
  }

  async markInsufficient(): Promise<void> {
    await this.setDailyStatus('insufficient');
  }

  async getLastResetKey(): Promise<string> {
    const data = await this.loadData();
    return data?.lastReset || '';
  }

  async getLastProcessedDate(): Promise<string> {
    const data = await this.loadData();
    return data?.lastProcessedDate || '';
  }

  async hasProcessedToday(): Promise<boolean> {
    const data = await this.loadData();
    return data?.lastProcessedDate === this.getTodayKey();
  }

  async resetForNewDay(): Promise<void> {
    const today = this.getTodayKey();
    const newData: DailyData = {
      date: today,
      currentPlayers: [],
      lastReset: today,
      formedTeams: null,
      dailyStatus: 'collecting',
      lastProcessedDate: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const collection = await this.getCollection();
      await collection.replaceOne({ date: today }, newData, { upsert: true });
      console.log('🔄 Reset for new day completed');
    } catch (error) {
      console.error('❌ Error resetting for new day:', error);
    }
  }
}

// Export singleton instance
export const mongoPersistentStore = MongoPersistentStore.getInstance();
