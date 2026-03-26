'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.playersDB = void 0;
exports.getPlayerByName = getPlayerByName;
exports.getAllPlayerNames = getAllPlayerNames;
// Player database with ratings and positions
exports.playersDB = [
  {
    name: 'Abhilash',
    position: 'midfielder',
    rating: 12,
  },
  {
    name: 'Abhiroop',
    position: 'defender',
    rating: 11,
  },
  {
    name: 'Aditya',
    position: 'midfielder',
    rating: 20,
  },
  {
    name: 'Anish',
    position: 'defender',
    rating: 5,
  },
  {
    name: 'Arjun',
    position: 'defender',
    rating: 13,
  },
  {
    name: 'Ashley',
    position: 'midfielder',
    rating: 16,
  },
  {
    name: 'Bino',
    position: 'midfielder',
    rating: 16,
  },
  {
    name: 'Bishak',
    position: 'midfielder',
    rating: 15,
  },
  {
    name: 'Bishu',
    position: 'forward',
    rating: 10,
  },
  {
    name: 'Chakri',
    position: 'midfielder',
    rating: 9,
  },
  {
    name: 'Dipu',
    position: 'forward',
    rating: 4,
  },
  {
    name: 'Don',
    position: 'defender',
    rating: 9,
  },
  {
    name: 'Farman',
    position: 'midfielder',
    rating: 18,
  },
  {
    name: 'Ghani',
    position: 'forward',
    rating: 19,
  },
  {
    name: 'Hema',
    position: 'defender',
    rating: 6,
  },
  {
    name: 'Himmat',
    position: 'defender',
    rating: 4,
  },
  {
    name: 'Jayakrishnan',
    position: 'goalkeeper',
    rating: 9,
  },
  {
    name: 'Jayesh',
    position: 'midfielder',
    rating: 13,
  },
  {
    name: 'Jikku',
    position: 'forward',
    rating: 19,
  },
  {
    name: 'Joseph',
    position: 'midfielder',
    rating: 17,
  },
  {
    name: 'KK',
    position: 'midfielder',
    rating: 9,
  },
  {
    name: 'Labib',
    position: 'midfielder',
    rating: 12,
  },
  {
    name: 'Mahesh',
    position: 'midfielder',
    rating: 13,
  },
  {
    name: 'Manaz',
    position: 'forward',
    rating: 15,
  },
  {
    name: 'Manish',
    position: 'forward',
    rating: 3,
  },
  {
    name: 'Manoj B',
    position: 'goalkeeper',
    rating: 6,
  },
  {
    name: 'Manoj M',
    position: 'midfielder',
    rating: 14,
  },
  {
    name: 'Mathew',
    position: 'defender',
    rating: 6,
  },
  {
    name: 'Mozart',
    position: 'forward',
    rating: 11,
  },
  {
    name: 'Nelson',
    position: 'forward',
    rating: 16,
  },
  {
    name: 'Niju',
    position: 'defender',
    rating: 4,
  },
  {
    name: 'Nikhil',
    position: 'goalkeeper',
    rating: 6,
  },
  {
    name: 'Nivin',
    position: 'midfielder',
    rating: 14,
  },
  {
    name: 'Paul',
    position: 'defender',
    rating: 13,
  },
  {
    name: 'Praneel',
    position: 'defender',
    rating: 6,
  },
  {
    name: 'Prashanth',
    position: 'defender',
    rating: 11,
  },
  {
    name: 'Prasoon',
    position: 'defender',
    rating: 11,
  },
  {
    name: 'Praveen',
    position: 'forward',
    rating: 17,
  },
  {
    name: 'Rejul',
    position: 'forward',
    rating: 11,
  },
  {
    name: 'Remilin',
    position: 'defender',
    rating: 13,
  },
  {
    name: 'Robin',
    position: 'midfielder',
    rating: 9,
  },
  {
    name: 'Sajith',
    position: 'goalkeeper',
    rating: 14,
  },
  {
    name: 'Saju',
    position: 'forward',
    rating: 5,
  },
  {
    name: 'Saran',
    position: 'midfielder',
    rating: 11,
  },
  {
    name: 'Shafeer',
    position: 'midfielder',
    rating: 10,
  },
  {
    name: 'Shamseer',
    position: 'defender',
    rating: 9,
  },
  {
    name: 'Sharhan',
    position: 'goalkeeper',
    rating: 12,
  },
  {
    name: 'Shihab',
    position: 'midfielder',
    rating: 18,
  },
  {
    name: 'Sibi',
    position: 'defender',
    rating: 9,
  },
  {
    name: 'Sijoy',
    position: 'defender',
    rating: 4,
  },
  {
    name: 'Sini',
    position: 'defender',
    rating: 4,
  },
  {
    name: 'Sobin',
    position: 'defender',
    rating: 14,
  },
  {
    name: 'Sooraj',
    position: 'defender',
    rating: 13,
  },
  {
    name: 'Sree',
    position: 'defender',
    rating: 12,
  },
  {
    name: 'Subbu',
    position: 'midfielder',
    rating: 4,
  },
  {
    name: 'Varun',
    position: 'forward',
    rating: 15,
  },
  {
    name: 'Vineeth',
    position: 'defender',
    rating: 11,
  },
  {
    name: 'Vipin',
    position: 'defender',
    rating: 8,
  },
  {
    name: 'Visakhan',
    position: 'forward',
    rating: 12,
  },
  {
    name: 'Vivek',
    position: 'defender',
    rating: 9,
  },
  {
    name: 'Zubair',
    position: 'midfielder',
    rating: 15,
  },
];
function getPlayerByName(name) {
  return exports.playersDB.find(function (p) {
    return p.name.toLowerCase() === name.toLowerCase();
  });
}
function getAllPlayerNames() {
  return exports.playersDB.map(function (p) {
    return p.name;
  });
}
