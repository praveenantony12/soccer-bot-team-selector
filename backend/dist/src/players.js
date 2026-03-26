"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playersDB = void 0;
exports.getPlayerByName = getPlayerByName;
exports.getAllPlayerNames = getAllPlayerNames;
// Player database with ratings and positions
exports.playersDB = [
  {
    "name": "Abhilash",
    "position": "midfielder",
    "value": 12
  },
  {
    "name": "Abhiroop",
    "position": "defender",
    "value": 11
  },
  {
    "name": "Aditya",
    "position": "midfielder",
    "value": 20
  },
  {
    "name": "Anish",
    "position": "defender",
    "value": 5
  },
  {
    "name": "Arjun",
    "position": "defender",
    "value": 13
  },
  {
    "name": "Ashley",
    "position": "midfielder",
    "value": 16
  },
  {
    "name": "Bino",
    "position": "midfielder",
    "value": 16
  },
  {
    "name": "Bishak",
    "position": "midfielder",
    "value": 15
  },
  {
    "name": "Bishu",
    "position": "forward",
    "value": 10
  },
  {
    "name": "Chakri",
    "position": "midfielder",
    "value": 9
  },
  {
    "name": "Dipu",
    "position": "forward",
    "value": 4
  },
  {
    "name": "Don",    "position": "defender",
    "value": 9
  },
  {
    "name": "Farman",
    "position": "midfielder",
    "value": 18
  },
  {
    "name": "Ghani",
    "position": "forward",
    "value": 19
  },
  {
    "name": "Hema",
    "position": "defender",
    "value": 6
  },
  {
    "name": "Himmat",
    "position": "defender",
    "value": 4
  },
  {
    "name": "Jayakrishnan",
    "position": "goalkeeper",
    "value": 9
  },
  {
    "name": "Jayesh",
    "position": "midfielder",
    "value": 13
  },
  {
    "name": "Jikku",
    "position": "forward",
    "value": 19
  },
  {
    "name": "Joseph",
    "position": "midfielder",
    "value": 17
  },
  {
    "name": "KK",
    "position": "midfielder",
    "value": 9
  },
  {
    "name": "Labib",
    "position": "midfielder",
    "value": 12
  },
  {
    "name": "Mahesh",
    "position": "midfielder",
    "value": 13
  },
  {
    "name": "Manaz",
    "position": "forward",
    "value": 15
  },
  {
    "name": "Manish",
    "position": "forward",
    "value": 3
  },
  {
    "name": "Manoj B",
    "position": "goalkeeper",
    "value": 6
  },
  {
    "name": "Manoj M",
    "position": "midfielder",
    "value": 14
  },
  {
    "name": "Mathew",
    "position": "defender",
    "value": 6
  },
  {
    "name": "Mozart",
    "position": "forward",
    "value": 11
  },
  {
    "name": "Nelson",
    "position": "forward",
    "value": 16
  },
  {
    "name": "Niju",
    "position": "defender",
    "value": 4
  },
  {
    "name": "Nikhil",
    "position": "goalkeeper",
    "value": 6
  },
  {
    "name": "Nivin",
    "position": "midfielder",
    "value": 14
  },
  {
    "name": "Paul",
    "position": "defender",
    "value": 13
  },
  {
    "name": "Praneel",
    "position": "defender",
    "value": 6
  },
  {
    "name": "Prashanth",
    "position": "defender",
    "value": 11
  },
  {
    "name": "Prasoon",
    "position": "defender",
    "value": 11
  },
  {
    "name": "Praveen",
    "position": "forward",
    "value": 17
  },
  {
    "name": "Rejul",
    "position": "forward",
    "value": 11
  },
  {
    "name": "Remilin",
    "position": "defender",
    "value": 13
  },
  {
    "name": "Robin",
    "position": "midfielder",
    "value": 9
  },
  {
    "name": "Sajith",
    "position": "goalkeeper",
    "value": 14
  },
  {
    "name": "Saju",
    "position": "forward",
    "value": 5
  },
  {
    "name": "Saran",
    "position": "midfielder",
    "value": 11
  },
  {
    "name": "Shafeer",
    "position": "midfielder",
    "value": 10
  },
  {
    "name": "Shamseer",
    "position": "defender",
    "value": 9
  },
  {
    "name": "Sharhan",
    "position": "goalkeeper",
    "value": 12
  },
  {
    "name": "Shihab",
    "position": "midfielder",
    "value": 18
  },
  {
    "name": "Sibi",
    "position": "defender",
    "value": 9
  },
  {
    "name": "Sijoy",
    "position": "defender",
    "value": 4
  },
  {
    "name": "Sini",
    "position": "defender",
    "value": 4
  },
  {
    "name": "Sobin",
    "position": "defender",
    "value": 14
  },
  {
    "name": "Sooraj",
    "position": "defender",
    "value": 13
  },
  {
    "name": "Sree",
    "position": "defender",
    "value": 12
  },
  {
    "name": "Subbu",
    "position": "midfielder",
    "value": 4
  },
  {
    "name": "Varun",
    "position": "forward",
    "value": 15
  },
  {
    "name": "Vineeth",
    "position": "defender",
    "value": 11
  },
  {
    "name": "Vipin",
    "position": "defender",
    "value": 8
  },
  {
    "name": "Visakhan",
    "position": "forward",
    "value": 12
  },
  {
    "name": "Vivek",
    "position": "defender",
    "value": 9
  },
  {
    "name": "Zubair",
    "position": "midfielder",
    "value": 15
  }
];
function getPlayerByName(name) {
    const player = exports.playersDB.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!player) return undefined;
    // Normalize: map 'value' field to 'rating' for the team balancer
    return { name: player.name, position: player.position, rating: player.value ?? 5.0 };
}
function getAllPlayerNames() {
    return exports.playersDB.map(p => p.name);
}
