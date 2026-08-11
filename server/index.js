require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- Products ---
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// --- Orders / Checkout ---
app.post('/api/checkout', (req, res) => {
  const { items, total } = req.body;
  if (!items || !Array.isArray(items) || typeof total !== 'number') {
    return res.status(400).json({ error: 'Invalid order payload' });
  }
  const insert = db.prepare('INSERT INTO orders (items, total, status) VALUES (?, ?, ?)');
  const result = insert.run(JSON.stringify(items), total, 'confirmed');

  const pointsEarned = Math.floor(total);
  const existing = db.prepare('SELECT * FROM rewards WHERE user_id = ?').get('guest');
  if (existing) {
    db.prepare('UPDATE rewards SET points = points + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(pointsEarned, 'guest');
  } else {
    db.prepare('INSERT INTO rewards (user_id, points) VALUES (?, ?)').run('guest', pointsEarned);
  }

  res.json({ orderId: result.lastInsertRowid, status: 'confirmed', pointsEarned });
});

app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders.map((o) => ({ ...o, items: JSON.parse(o.items) })));
});

// --- Rewards ---
app.get('/api/rewards', (req, res) => {
  const userId = req.query.userId || 'guest';
  const reward = db.prepare('SELECT * FROM rewards WHERE user_id = ?').get(userId);
  res.json(reward || { user_id: userId, points: 0 });
});

// --- AI Barista Proxy ---
app.post('/api/barista', async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require('@google/genai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'AI service not configured' });

    const { message } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(message);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error('Barista error:', err.message);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Coffee-Shop server running on port ${PORT}`);
});
