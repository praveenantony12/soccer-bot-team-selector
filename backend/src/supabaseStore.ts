import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface DailyData {
  date: string; // Format: YYYY-MM-DD
  current_players: string[];
  last_reset: string;
  formed_teams: any;
  daily_status: 'collecting' | 'formed' | 'insufficient';
  last_processed_date: string;
  created_at: string;
  updated_at: string;
}

class SupabasePersistentStore {
  private static instance: SupabasePersistentStore;
  private supabase: SupabaseClient | null = null;
  private initialized: boolean = false;

  static getInstance(): SupabasePersistentStore {
    if (!SupabasePersistentStore.instance) {
      SupabasePersistentStore.instance = new SupabasePersistentStore();
    }
    return SupabasePersistentStore.instance;
  }

  private constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.log('⚠️ Supabase credentials not provided, falling back to file storage');
        return;
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test connection
      const { error } = await this.supabase.from('daily_data').select('count').limit(1);
      if (error) {
        console.error('❌ Supabase connection failed:', error);
        this.supabase = null;
        return;
      }

      this.initialized = true;
      console.log('✅ Supabase persistent store initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      this.supabase = null;
    }
  }

  private async getSupabase(): Promise<SupabaseClient> {
    if (!this.supabase && !this.initialized) {
      await this.initialize();
    }
    
    if (!this.supabase) {
      throw new Error('Supabase not available');
    }
    
    return this.supabase;
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
      const supabase = await this.getSupabase();
      const today = this.getTodayKey();
      
      const { data, error } = await supabase
        .from('daily_data')
        .select('*')
        .eq('date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }
      
      if (data) {
        console.log('📁 Loaded persistent data from Supabase');
        // Convert Supabase snake_case to camelCase for consistency
        // Handle JSON strings for array fields
        let currentPlayers = data.current_players || [];
        if (typeof currentPlayers === 'string') {
          try {
            currentPlayers = JSON.parse(currentPlayers);
          } catch (e) {
            currentPlayers = [];
          }
        }
        
        let formedTeams = data.formed_teams || null;
        if (typeof formedTeams === 'string') {
          try {
            formedTeams = JSON.parse(formedTeams);
          } catch (e) {
            formedTeams = null;
          }
        }
        
        return {
          date: data.date,
          current_players: Array.isArray(currentPlayers) ? currentPlayers : [],
          last_reset: data.last_reset || '',
          formed_teams: formedTeams,
          daily_status: data.daily_status || 'collecting',
          last_processed_date: data.last_processed_date || '',
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        };
      } else {
        console.log('📁 No data found for today, creating new entry');
        return await this.createNewDay();
      }
    } catch (error) {
      console.error('❌ Error loading data from Supabase:', error);
      // Fallback to empty state
      return await this.createNewDay();
    }
  }

  private async createNewDay(): Promise<DailyData> {
    const today = this.getTodayKey();
    const newData: Partial<DailyData> = {
      date: today,
      current_players: [],
      last_reset: today,
      formed_teams: null,
      daily_status: 'collecting',
      last_processed_date: ''
    };

    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('daily_data')
        .insert(newData)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('🆕 Created new daily data entry');
      // Convert Supabase snake_case to camelCase for consistency
      return {
        date: data.date,
        current_players: Array.isArray(data.current_players) ? data.current_players : [],
        last_reset: data.last_reset || '',
        formed_teams: data.formed_teams || null,
        daily_status: data.daily_status || 'collecting',
        last_processed_date: data.last_processed_date || '',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error creating new daily data:', error);
      // Return in-memory data as fallback
      return {
        date: today,
        current_players: [],
        last_reset: today,
        formed_teams: null,
        daily_status: 'collecting',
        last_processed_date: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  async saveData(data: Partial<DailyData>): Promise<void> {
    try {
      const supabase = await this.getSupabase();
      const today = this.getTodayKey();
      
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('daily_data')
        .update(updateData)
        .eq('date', today);
      
      if (error) throw error;
      
      console.log('💾 Saved persistent data to Supabase');
    } catch (error) {
      console.error('❌ Error saving data to Supabase:', error);
    }
  }

  async getPlayers(): Promise<string[]> {
    const data = await this.loadData();
    let players = data?.current_players || [];
    
    // Handle case where Supabase returns JSON string instead of array
    if (typeof players === 'string') {
      try {
        players = JSON.parse(players);
      } catch (e) {
        console.log('⚠️ Failed to parse current_players as JSON, using empty array');
        players = [];
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(players)) {
      console.log('⚠️ current_players is not an array, converting');
      players = [];
    }
    
    console.log('🔍 Debug - current_players from Supabase:', players, 'type:', typeof players, 'isArray:', Array.isArray(players));
    return players;
  }

  async addPlayer(name: string): Promise<void> {
    const data = await this.loadData();
    if (data && !data.current_players.includes(name)) {
      data.current_players.push(name);
      await this.saveData({ current_players: data.current_players });
      console.log(`➕ Player ${name} added. Total: ${data.current_players.length}`);
    }
  }

  async removePlayer(name: string): Promise<void> {
    const data = await this.loadData();
    if (data) {
      data.current_players = data.current_players.filter(p => p !== name);
      await this.saveData({ current_players: data.current_players });
      console.log(`➖ Player ${name} removed. Total: ${data.current_players.length}`);
    }
  }

  async clearPlayers(): Promise<void> {
    const data = await this.loadData();
    if (data) {
      data.current_players = [];
      data.last_reset = this.getTodayKey();
      await this.saveData({ current_players: data.current_players, last_reset: data.last_reset });
      console.log('🗑️ Players cleared');
    }
  }

  async getPlayerCount(): Promise<number> {
    const players = await this.getPlayers();
    return players.length;
  }

  async getFormedTeams(): Promise<any> {
    const data = await this.loadData();
    return data?.formed_teams;
  }

  async saveTeams(teams: any): Promise<void> {
    const data = await this.loadData();
    if (data) {
      data.formed_teams = teams;
      data.daily_status = 'formed';
      data.last_processed_date = this.getTodayKey();
      await this.saveData({ 
        formed_teams: teams, 
        daily_status: data.daily_status, 
        last_processed_date: data.last_processed_date 
      });
      console.log('🏆 Teams saved to Supabase');
    }
  }

  async getDailyStatus(): Promise<'collecting' | 'formed' | 'insufficient'> {
    const data = await this.loadData();
    return data?.daily_status || 'collecting';
  }

  async setDailyStatus(status: 'collecting' | 'formed' | 'insufficient'): Promise<void> {
    const data = await this.loadData();
    if (data) {
      data.daily_status = status;
      data.last_processed_date = this.getTodayKey();
      await this.saveData({ 
        daily_status: status, 
        last_processed_date: data.last_processed_date 
      });
    }
  }

  async markInsufficient(): Promise<void> {
    await this.setDailyStatus('insufficient');
  }

  async getLastResetKey(): Promise<string> {
    const data = await this.loadData();
    return data?.last_reset || '';
  }

  async getLastProcessedDate(): Promise<string> {
    const data = await this.loadData();
    return data?.last_processed_date || '';
  }

  async hasProcessedToday(): Promise<boolean> {
    const data = await this.loadData();
    return data?.last_processed_date === this.getTodayKey();
  }

  async resetForNewDay(): Promise<void> {
    const today = this.getTodayKey();
    const newData: Partial<DailyData> = {
      date: today,
      current_players: [],
      last_reset: today,
      formed_teams: null,
      daily_status: 'collecting',
      last_processed_date: ''
    };

    try {
      const supabase = await this.getSupabase();
      const { error } = await supabase
        .from('daily_data')
        .upsert(newData, { onConflict: 'date' });
      
      if (error) throw error;
      
      console.log('🔄 Reset for new day completed');
    } catch (error) {
      console.error('❌ Error resetting for new day:', error);
    }
  }
}

// Export singleton instance
export const supabaseStore = SupabasePersistentStore.getInstance();
