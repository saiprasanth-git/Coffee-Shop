const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'coffeeshop.db'));

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  image TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  items TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL DEFAULT 'guest',
  points INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const seedProducts = [
  { id: 'esp', name: 'Espresso', category: 'Coffee', price: 3.5, description: 'Rich and bold single shot.', image: '/images/espresso.jpg' },
  { id: 'lat', name: 'Latte', category: 'Coffee', price: 4.5, description: 'Smooth espresso with steamed milk.', image: '/images/latte.jpg' },
  { id: 'cap', name: 'Cappuccino', category: 'Coffee', price: 4.5, description: 'Espresso topped with foamy milk.', image: '/images/cappuccino.jpg' },
  { id: 'mch', name: 'Mocha', category: 'Coffee', price: 5.0, description: 'Espresso with chocolate and milk.', image: '/images/mocha.jpg' },
  { id: 'coldbrew', name: 'Cold Brew', category: 'Cold Drinks', price: 4.0, description: 'Slow-steeped, smooth and cold.', image: '/images/coldbrew.jpg' },
  { id: 'icedlatte', name: 'Iced Latte', category: 'Cold Drinks', price: 4.75, description: 'Chilled espresso with milk over ice.', image: '/images/icedlatte.jpg' },
  { id: 'croissant', name: 'Croissant', category: 'Pastries', price: 3.25, description: 'Buttery, flaky French pastry.', image: '/images/croissant.jpg' },
  { id: 'muffin', name: 'Blueberry Muffin', category: 'Pastries', price: 3.0, description: 'Moist muffin loaded with blueberries.', image: '/images/muffin.jpg' },
];

const insert = db.prepare(`INSERT OR IGNORE INTO products (id, name, category, price, description, image) VALUES (@id, @name, @category, @price, @description, @image)`);
const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});
insertMany(seedProducts);

module.exports = db;
