"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playersDB = void 0;
exports.getPlayerByName = getPlayerByName;
exports.getAllPlayerNames = getAllPlayerNames;
// Player database with ratings and positions
exports.playersDB = [
    { name: "john", rating: 8.5, position: "forward" },
    { name: "mike", rating: 7.2, position: "midfielder" },
    { name: "alex", rating: 9.1, position: "defender" },
    { name: "sam", rating: 6.8, position: "forward" },
    { name: "rob", rating: 7.5, position: "midfielder" },
    { name: "dan", rating: 8.0, position: "goalkeeper" },
    { name: "steve", rating: 6.5, position: "defender" },
    { name: "mark", rating: 7.8, position: "midfielder" },
    { name: "james", rating: 8.3, position: "forward" },
    { name: "david", rating: 7.0, position: "defender" },
    { name: "chris", rating: 6.2, position: "midfielder" },
    { name: "tom", rating: 8.7, position: "forward" },
    { name: "paul", rating: 7.3, position: "defender" },
    { name: "andrew", rating: 6.9, position: "midfielder" },
    { name: "jason", rating: 8.1, position: "goalkeeper" },
    { name: "ryan", rating: 7.6, position: "forward" },
    { name: "kevin", rating: 7.4, position: "defender" },
    { name: "brian", rating: 8.2, position: "midfielder" },
    { name: "george", rating: 6.7, position: "forward" },
    { name: "edward", rating: 7.9, position: "defender" },
    { name: "frank", rating: 8.4, position: "midfielder" },
    { name: "henry", rating: 7.1, position: "goalkeeper" },
    { name: "walter", rating: 6.6, position: "defender" },
    { name: "gary", rating: 7.7, position: "midfielder" },
    { name: "ronald", rating: 8.6, position: "forward" },
    { name: "timothy", rating: 7.0, position: "defender" },
    { name: "joseph", rating: 8.0, position: "midfielder" },
    { name: "charles", rating: 6.8, position: "forward" },
    { name: "anthony", rating: 7.5, position: "goalkeeper" },
    { name: "matthew", rating: 8.3, position: "defender" },
    { name: "joshua", rating: 7.2, position: "midfielder" },
    { name: "daniel", rating: 8.1, position: "forward" },
    { name: "patricia", rating: 6.4, position: "defender" },
    { name: "jennifer", rating: 7.3, position: "midfielder" },
    { name: "linda", rating: 7.8, position: "forward" },
    { name: "elizabeth", rating: 8.5, position: "goalkeeper" },
    { name: "barbara", rating: 6.9, position: "defender" },
    { name: "susan", rating: 7.6, position: "midfielder" },
    { name: "jessica", rating: 8.0, position: "forward" },
    { name: "sarah", rating: 7.4, position: "defender" },
    { name: "karen", rating: 6.7, position: "midfielder" },
    { name: "nancy", rating: 7.9, position: "forward" },
    { name: "lisa", rating: 8.2, position: "goalkeeper" },
    { name: "betty", rating: 6.5, position: "defender" },
    { name: "helen", rating: 7.7, position: "midfielder" },
    { name: "sandra", rating: 8.4, position: "forward" },
    { name: "donna", rating: 7.1, position: "defender" },
    { name: "carol", rating: 6.8, position: "midfielder" }
];
function getPlayerByName(name) {
    return exports.playersDB.find(function (p) { return p.name.toLowerCase() === name.toLowerCase(); });
}
function getAllPlayerNames() {
    return exports.playersDB.map(function (p) { return p.name; });
}
