"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cors_1 = require("cors");
var express_1 = require("express");
var path_1 = require("path");
var url_1 = require("url");
// Import backend functionality
var node_cron_1 = require("node-cron");
var twilio_1 = require("twilio");
var formatter_1 = require("./src/formatter");
var persistentStore_1 = require("./src/persistentStore");
var players_1 = require("./src/players");
var teamBalancer_1 = require("./src/teamBalancer");
// Fix __dirname for ES modules
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = (0, path_1.join)(__filename, '..');
var app = (0, express_1.default)();
app.use(express_1.default.json());
// ✅ Enable CORS
app.use((0, cors_1.default)({
    origin: ["https://soccer-bot-unified.onrender.com", "http://localhost:4200"],
    methods: ["GET", "POST"]
}));
// 📁 Serve frontend static files
var frontendPath = (0, path_1.join)(__dirname, '../dist/soccer-bot-team-selector');
app.use(express_1.default.static(frontendPath));
// 🔄 API Routes
app.get("/api/players", function (req, res) {
    res.json((0, players_1.getAllPlayerNames)());
});
app.get("/api/current", function (req, res) {
    res.json(persistentStore_1.persistentStore.getPlayers());
});
app.post("/api/join", function (req, res) {
    var name = req.body.name;
    persistentStore_1.persistentStore.addPlayer(name);
    res.json({ success: true });
});
app.post("/api/leave", function (req, res) {
    var name = req.body.name;
    persistentStore_1.persistentStore.removePlayer(name);
    res.json({ success: true });
});
app.get("/api/health", function (req, res) {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        players: persistentStore_1.persistentStore.getPlayers().length
    });
});
// 🏠 Serve frontend for all other routes
app.get('*', function (req, res) {
    res.sendFile((0, path_1.join)(frontendPath, 'index.html'));
});
var PORT = process.env.PORT || 3000;
var GROUP_ID = process.env.WHATSAPP_GROUP_JID;
var client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// 🕘 Reminder - Every minute for testing
node_cron_1.default.schedule("* * * * *", function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Sending reminder...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.messages.create({
                        body: (0, formatter_1.formatReminder)(),
                        from: process.env.TWILIO_NUMBER,
                        to: GROUP_ID
                    })];
            case 2:
                _a.sent();
                console.log("✅ Reminder sent successfully");
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error("❌ Failed to send reminder:", error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// 🕖 Team generation - Every 2 minutes for testing
node_cron_1.default.schedule("*/2 * * * *", function () { return __awaiter(void 0, void 0, void 0, function () {
    var names, error_2, players, result, message, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Generating teams...");
                names = persistentStore_1.persistentStore.getPlayers();
                console.log("Current players: ".concat(names.length));
                if (!(names.length < 12)) return [3 /*break*/, 5];
                console.log("\u274C Not enough players (".concat(names.length, "). Skipping team generation."));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.messages.create({
                        body: (0, formatter_1.formatInsufficientPlayers)(names.length),
                        from: process.env.TWILIO_NUMBER,
                        to: GROUP_ID
                    })];
            case 2:
                _a.sent();
                console.log("✅ Insufficient players message sent");
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error("❌ Failed to send insufficient players message:", error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
            case 5:
                players = names.map(function (name) {
                    var player = (0, players_1.getPlayerByName)(name);
                    if (!player) {
                        console.warn("\u26A0\uFE0F Player \"".concat(name, "\" not found in database"));
                        return { name: name, rating: 5.0, position: "player" };
                    }
                    return player;
                });
                _a.label = 6;
            case 6:
                _a.trys.push([6, 8, , 9]);
                result = (0, teamBalancer_1.balanceTeams)(players);
                message = (0, formatter_1.formatTeams)(result);
                return [4 /*yield*/, client.messages.create({
                        body: message,
                        from: process.env.TWILIO_NUMBER,
                        to: GROUP_ID
                    })];
            case 7:
                _a.sent();
                persistentStore_1.persistentStore.clearPlayers();
                console.log("✅ Teams sent + reset");
                return [3 /*break*/, 9];
            case 8:
                error_3 = _a.sent();
                console.error("❌ Failed to generate or send teams:", error_3);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Unified Soccer Bot running on ".concat(PORT));
    console.log("\uD83D\uDCC5 Frontend served from: ".concat(frontendPath));
    console.log("\uD83D\uDCC5 Reminder scheduled: Every minute (testing)");
    console.log("\u26BD Team generation: Every 2 minutes (testing)");
});
