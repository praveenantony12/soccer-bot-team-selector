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
                lastReset: this.lastReset
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
        this.lastReset = new Date().toDateString();
        this.saveData();
        console.log('🗑️ Players cleared for new day');
    }
    getPlayerCount() {
        return this.currentPlayers.length;
    }
}
exports.PersistentStore = PersistentStore;
// Export singleton instance
exports.persistentStore = PersistentStore.getInstance();
