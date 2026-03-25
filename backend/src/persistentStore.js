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
                // Check if it's a new day (reset at midnight)
                var today = new Date().toDateString();
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
    };
    PersistentStore.prototype.saveData = function () {
        try {
            var data = {
                currentPlayers: this.currentPlayers,
                lastReset: this.lastReset
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
        this.lastReset = new Date().toDateString();
        this.saveData();
        console.log('🗑️ Players cleared for new day');
    };
    PersistentStore.prototype.getPlayerCount = function () {
        return this.currentPlayers.length;
    };
    return PersistentStore;
}());
exports.PersistentStore = PersistentStore;
// Export singleton instance
exports.persistentStore = PersistentStore.getInstance();
