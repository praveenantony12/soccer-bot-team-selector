"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistentStore = exports.PersistentStore = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const DATA_FILE = (0, path_1.join)(process.cwd(), 'players.json');
class PersistentStore {
    constructor() {
        this.currentPlayers = [];
        this.playerTokens = {};
        this.lastReset = '';
        this.formedTeams = null;
        this.dailyStatus = 'collecting';
        this.lastProcessedDate = '';
        this.loadData();
    }
    static getInstance() {
        if (!PersistentStore.instance) {
            PersistentStore.instance = new PersistentStore();
        }
        return PersistentStore.instance;
    }
    loadData() {
        try {
            // Try file storage first
            if ((0, fs_1.existsSync)(DATA_FILE)) {
                const data = (0, fs_1.readFileSync)(DATA_FILE, 'utf8');
                const parsed = JSON.parse(data);
                this.currentPlayers = parsed.currentPlayers || [];
                this.playerTokens = parsed.playerTokens || {};
                this.lastReset = parsed.lastReset || '';
                this.formedTeams = parsed.formedTeams || null;
                this.dailyStatus = parsed.dailyStatus || 'collecting';
                this.lastProcessedDate = parsed.lastProcessedDate || '';
                console.log('📁 Loaded persistent data from file');
            }
            else {
                console.log('📁 No data file found, using env backup');
            }
        }
        catch (error) {
            console.error('📁 Error loading data file, trying env backup:', error);
        }
        // Backup: Load from environment variables (for Render's ephemeral storage)
        try {
            const envPlayers = process.env.PERSISTENT_PLAYERS;
            const envTokens = process.env.PERSISTENT_PLAYER_TOKENS;
            const envLastReset = process.env.PERSISTENT_LAST_RESET;
            const envStatus = process.env.PERSISTENT_STATUS;
            const envTeams = process.env.PERSISTENT_TEAMS;
            if (envPlayers && this.currentPlayers.length === 0) {
                this.currentPlayers = JSON.parse(envPlayers);
                this.playerTokens = envTokens ? JSON.parse(envTokens) : {};
                this.lastReset = envLastReset || this.getTodayKey();
                this.dailyStatus = envStatus || 'collecting';
                this.formedTeams = envTeams ? JSON.parse(envTeams) : null;
                this.lastProcessedDate = process.env.PERSISTENT_PROCESSED_DATE || '';
                console.log('🔄 Loaded persistent data from environment variables');
            }
        }
        catch (error) {
            console.error(' Error loading env backup:', error);
        }
        // Check if it's a new day (reset at midnight)
        const today = this.getTodayKey();
        if (this.lastReset !== today) {
            console.log('🔄 New day detected, resetting players and teams');
            this.currentPlayers = [];
            this.playerTokens = {};
            this.formedTeams = null;
            this.dailyStatus = 'collecting';
            this.lastProcessedDate = '';
            this.lastReset = today;
            this.saveData();
        }
    }
    saveData() {
        try {
            const data = {
                currentPlayers: this.currentPlayers,
                playerTokens: this.playerTokens,
                lastReset: this.lastReset,
                formedTeams: this.formedTeams,
                dailyStatus: this.dailyStatus,
                lastProcessedDate: this.lastProcessedDate
            };
            // Save to file (for local development)
            (0, fs_1.writeFileSync)(DATA_FILE, JSON.stringify(data, null, 2));
            console.log('💾 Saved persistent data to file');
            // Backup: Save to environment variables (for Render's ephemeral storage)
            // Note: This only works if the environment allows setting env vars at runtime
            try {
                process.env.PERSISTENT_PLAYERS = JSON.stringify(this.currentPlayers);
                process.env.PERSISTENT_PLAYER_TOKENS = JSON.stringify(this.playerTokens);
                process.env.PERSISTENT_LAST_RESET = this.lastReset;
                process.env.PERSISTENT_STATUS = this.dailyStatus;
                process.env.PERSISTENT_TEAMS = JSON.stringify(this.formedTeams);
                process.env.PERSISTENT_PROCESSED_DATE = this.lastProcessedDate;
                console.log('💾 Saved persistent data to environment variables');
            }
            catch (envError) {
                console.log('⚠️ Could not save to environment variables (expected on some platforms)');
            }
        }
        catch (error) {
            console.error('❌ Error saving persistent data:', error);
        }
    }
    addPlayer(name) {
        if (!this.currentPlayers.includes(name)) {
            this.currentPlayers.push(name);
            this.saveData();
            console.log(`➕ Player ${name} added. Total: ${this.currentPlayers.length}`);
        }
    }
    removePlayer(name) {
        this.currentPlayers = this.currentPlayers.filter(p => p !== name);
        delete this.playerTokens[name];
        this.saveData();
        console.log(`➖ Player ${name} removed. Total: ${this.currentPlayers.length}`);
    }
    // Token management methods
    setPlayerToken(name, token) {
        this.playerTokens[name] = {
            token,
            createdAt: new Date().toISOString()
        };
        this.saveData();
        console.log(`🔑 Token set for player ${name}`);
    }
    getPlayerToken(name) {
        return this.playerTokens[name];
    }
    validatePlayerToken(name, token) {
        const playerToken = this.playerTokens[name];
        return playerToken !== undefined && playerToken.token === token;
    }
    removePlayerToken(name) {
        delete this.playerTokens[name];
        this.saveData();
    }
    getPlayers() {
        return [...this.currentPlayers];
    }
    clearPlayers() {
        this.currentPlayers = [];
        this.playerTokens = {};
        this.lastReset = this.getTodayKey();
        this.saveData();
        console.log('🗑️ Players cleared');
    }
    saveTeams(teams) {
        this.formedTeams = teams;
        this.dailyStatus = 'formed';
        this.lastProcessedDate = this.getTodayKey();
        this.saveData();
        console.log('🏆 Teams saved to persistent store');
    }
    getFormedTeams() {
        return this.formedTeams;
    }
    getPlayerCount() {
        return this.currentPlayers.length;
    }
    markInsufficient() {
        this.dailyStatus = 'insufficient';
        this.formedTeams = null;
        this.lastProcessedDate = this.getTodayKey();
        this.saveData();
    }
    setDailyStatus(status) {
        this.dailyStatus = status;
        this.saveData();
    }
    getDailyStatus() {
        return this.dailyStatus;
    }
    getLastProcessedDate() {
        return this.lastProcessedDate;
    }
    hasProcessedToday() {
        return this.lastProcessedDate === this.getTodayKey();
    }
    getLastResetKey() {
        return this.lastReset;
    }
    resetForNewDay() {
        this.currentPlayers = [];
        this.playerTokens = {};
        this.formedTeams = null;
        this.dailyStatus = 'collecting';
        this.lastProcessedDate = '';
        this.lastReset = this.getTodayKey();
        this.saveData();
    }
    getTodayKey() {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: process.env.TEAM_TIMEZONE || 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    }
}
exports.PersistentStore = PersistentStore;
// Export singleton instance
exports.persistentStore = PersistentStore.getInstance();
