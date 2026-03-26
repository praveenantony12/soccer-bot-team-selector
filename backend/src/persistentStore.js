"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistentStore = exports.PersistentStore = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var DATA_FILE = (0, path_1.join)(process.cwd(), 'players.json');
var PersistentStore = /** @class */ (function () {
    function PersistentStore() {
        this.currentPlayers = [];
        this.lastReset = '';
        this.formedTeams = null;
        this.dailyStatus = 'collecting';
        this.lastProcessedDate = '';
        this.loadData();
    }
    PersistentStore.getInstance = function () {
        if (!PersistentStore.instance) {
            PersistentStore.instance = new PersistentStore();
        }
        return PersistentStore.instance;
    };
    PersistentStore.prototype.loadData = function () {
        try {
            if ((0, fs_1.existsSync)(DATA_FILE)) {
                var data = (0, fs_1.readFileSync)(DATA_FILE, 'utf8');
                var parsed = JSON.parse(data);
                this.currentPlayers = parsed.currentPlayers || [];
                this.lastReset = parsed.lastReset || '';
                this.formedTeams = parsed.formedTeams || null;
                this.dailyStatus = parsed.dailyStatus || 'collecting';
                this.lastProcessedDate = parsed.lastProcessedDate || '';
                // Check if it's a new day (reset at midnight)
                var today = this.getTodayKey();
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
    };
    PersistentStore.prototype.saveData = function () {
        try {
            var data = {
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
    };
    PersistentStore.prototype.addPlayer = function (name) {
        if (!this.currentPlayers.includes(name)) {
            this.currentPlayers.push(name);
            this.saveData();
            console.log("\u2795 Player ".concat(name, " added. Total: ").concat(this.currentPlayers.length));
        }
    };
    PersistentStore.prototype.removePlayer = function (name) {
        this.currentPlayers = this.currentPlayers.filter(function (p) { return p !== name; });
        this.saveData();
        console.log("\u2796 Player ".concat(name, " removed. Total: ").concat(this.currentPlayers.length));
    };
    PersistentStore.prototype.getPlayers = function () {
        return __spreadArray([], this.currentPlayers, true);
    };
    PersistentStore.prototype.clearPlayers = function () {
        this.currentPlayers = [];
        this.lastReset = this.getTodayKey();
        this.saveData();
        console.log('🗑️ Players cleared');
    };
    PersistentStore.prototype.saveTeams = function (teams) {
        this.formedTeams = teams;
        this.dailyStatus = 'formed';
        this.lastProcessedDate = this.getTodayKey();
        this.saveData();
        console.log('🏆 Teams saved to persistent store');
    };
    PersistentStore.prototype.getFormedTeams = function () {
        return this.formedTeams;
    };
    PersistentStore.prototype.getPlayerCount = function () {
        return this.currentPlayers.length;
    };
    PersistentStore.prototype.markInsufficient = function () {
        this.dailyStatus = 'insufficient';
        this.lastProcessedDate = this.getTodayKey();
        this.saveData();
    };
    PersistentStore.prototype.setDailyStatus = function (status) {
        this.dailyStatus = status;
        this.saveData();
    };
    PersistentStore.prototype.getDailyStatus = function () {
        return this.dailyStatus;
    };
    PersistentStore.prototype.getLastProcessedDate = function () {
        return this.lastProcessedDate;
    };
    PersistentStore.prototype.hasProcessedToday = function () {
        return this.lastProcessedDate === this.getTodayKey();
    };
    PersistentStore.prototype.getLastResetKey = function () {
        return this.lastReset;
    };
    PersistentStore.prototype.resetForNewDay = function () {
        this.currentPlayers = [];
        this.formedTeams = null;
        this.dailyStatus = 'collecting';
        this.lastProcessedDate = '';
        this.lastReset = this.getTodayKey();
        this.saveData();
    };
    PersistentStore.prototype.getTodayKey = function () {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    };
    return PersistentStore;
}());
exports.PersistentStore = PersistentStore;
// Export singleton instance
exports.persistentStore = PersistentStore.getInstance();
