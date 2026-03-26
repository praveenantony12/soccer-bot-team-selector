"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistentStore = exports.PersistentStore = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const DATA_FILE = (0, path_1.join)(process.cwd(), 'players.json');
class PersistentStore {
    constructor() {
        this.currentPlayers = [];
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
            if ((0, fs_1.existsSync)(DATA_FILE)) {
                const data = (0, fs_1.readFileSync)(DATA_FILE, 'utf8');
                const parsed = JSON.parse(data);
                this.currentPlayers = parsed.currentPlayers || [];
                this.lastReset = parsed.lastReset || '';
                this.formedTeams = parsed.formedTeams || null;
                this.dailyStatus = parsed.dailyStatus || 'collecting';
                this.lastProcessedDate = parsed.lastProcessedDate || '';
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
                console.log('📁 Loaded persistent data:', {
                    currentPlayers: this.currentPlayers.length,
                    lastReset: this.lastReset
                });
            }
        }
        catch (error) {
            console.error('❌ Error loading persistent data:', error);
            this.currentPlayers = [];
            this.lastReset = new Date().toDateString();
        }
    }
    saveData() {
        try {
            const data = {
                currentPlayers: this.currentPlayers,
                lastReset: this.lastReset,
                formedTeams: this.formedTeams,
                dailyStatus: this.dailyStatus,
                lastProcessedDate: this.lastProcessedDate
            };
            (0, fs_1.writeFileSync)(DATA_FILE, JSON.stringify(data, null, 2));
            console.log('💾 Saved persistent data');
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
        this.saveData();
        console.log(`➖ Player ${name} removed. Total: ${this.currentPlayers.length}`);
    }
    getPlayers() {
        return [...this.currentPlayers];
    }
    clearPlayers() {
        this.currentPlayers = [];
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
        this.formedTeams = null;
        this.dailyStatus = 'collecting';
        this.lastProcessedDate = '';
        this.lastReset = this.getTodayKey();
        this.saveData();
    }
    getTodayKey() {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    }
}
exports.PersistentStore = PersistentStore;
// Export singleton instance
exports.persistentStore = PersistentStore.getInstance();
