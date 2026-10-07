// Express REST API that uses the JSON files in ./data as a simple file-backed database.
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');

// --- tiny JSON "database" helpers -------------------------------------------
const readDb = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const writeDb = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
const round2 = (n) => Math.round(n * 100) / 100;
const sortByDateDesc = (txns) => [...txns].sort((a, b) => b.date.localeCompare(a.date));

function logTransaction(db, type, symbol, quantity, price) {
  db.transactions.unshift({
    id: randomUUID(),
    date: new Date().toISOString(),
    type,
    symbol,
    quantity,
    price,
  });
}

/** Shape returned by every holdings mutation so the client can update both signals at once. */
const portfolioPayload = (db) => ({
  holdings: db.holdings,
  transactions: sortByDateDesc(db.transactions),
});

// ============================================================================
// Holdings + transactions
// ============================================================================

// READ: all holdings
app.get('/api/holdings', (_req, res) => {
  res.json(readDb(PORTFOLIO_FILE).holdings);
});

// READ: all transactions, newest first
app.get('/api/transactions', (_req, res) => {
  res.json(sortByDateDesc(readDb(PORTFOLIO_FILE).transactions));
});

// CREATE: add a new holding (or top up an existing one) and log a BUY
app.post('/api/holdings', (req, res) => {
  const { symbol, name, assetClass, quantity, price } = req.body;
  if (!symbol || !name || !assetClass || !(quantity > 0) || !(price > 0)) {
    return res.status(400).json({ error: 'Invalid holding payload' });
  }

  const db = readDb(PORTFOLIO_FILE);
  const sym = String(symbol).trim().toUpperCase();
  const existing = db.holdings.find((h) => h.symbol === sym);

  if (existing) {
    const totalQty = existing.quantity + quantity;
    existing.avgCost = round2((existing.quantity * existing.avgCost + quantity * price) / totalQty);
    existing.quantity = totalQty;
    existing.currentPrice = price;
  } else {
    db.holdings.push({
      id: randomUUID(),
      symbol: sym,
      name: String(name).trim(),
      assetClass,
      quantity,
      avgCost: price,
      currentPrice: price,
    });
  }

  logTransaction(db, 'BUY', sym, quantity, price);
  writeDb(PORTFOLIO_FILE, db);
  res.status(201).json(portfolioPayload(db));
});

// UPDATE: edit an existing holding in place
app.put('/api/holdings/:id', (req, res) => {
  const { symbol, name, assetClass, quantity, price } = req.body;
  const db = readDb(PORTFOLIO_FILE);
  const holding = db.holdings.find((h) => h.id === req.params.id);
  if (!holding) return res.status(404).json({ error: 'Holding not found' });

  holding.symbol = String(symbol).trim().toUpperCase();
  holding.name = String(name).trim();
  holding.assetClass = assetClass;
  holding.quantity = quantity;
  holding.avgCost = price;
  holding.currentPrice = price;

  writeDb(PORTFOLIO_FILE, db);
  res.json(portfolioPayload(db));
});

// DELETE: sell (reduce or remove) a position and log a SELL
app.post('/api/holdings/:id/sell', (req, res) => {
  const quantity = Number(req.body.quantity);
  const db = readDb(PORTFOLIO_FILE);
  const holding = db.holdings.find((h) => h.id === req.params.id);
  if (!holding) return res.status(404).json({ error: 'Holding not found' });

  const soldQty = Math.min(quantity, holding.quantity);
  holding.quantity -= soldQty;
  db.holdings = db.holdings.filter((h) => h.quantity > 0);

  logTransaction(db, 'SELL', holding.symbol, soldQty, holding.currentPrice);
  writeDb(PORTFOLIO_FILE, db);
  res.json(portfolioPayload(db));
});

// ============================================================================
// Profile + contacts
// ============================================================================

// READ: the profile
app.get('/api/profile', (_req, res) => {
  res.json(readDb(PROFILE_FILE));
});

// UPDATE: the core profile details (name + address)
app.put('/api/profile/details', (req, res) => {
  const { fullName, addressLine1, city, country } = req.body;
  const profile = readDb(PROFILE_FILE);
  profile.fullName = String(fullName).trim();
  profile.addressLine1 = String(addressLine1).trim();
  profile.city = String(city).trim();
  profile.country = String(country).trim();
  writeDb(PROFILE_FILE, profile);
  res.json(profile);
});

// CREATE: add a contact
app.post('/api/profile/contacts', (req, res) => {
  const { type, value } = req.body;
  const profile = readDb(PROFILE_FILE);
  profile.contacts.push({ id: randomUUID(), type, value: String(value).trim() });
  writeDb(PROFILE_FILE, profile);
  res.status(201).json(profile);
});

// UPDATE: edit a contact
app.put('/api/profile/contacts/:id', (req, res) => {
  const { type, value } = req.body;
  const profile = readDb(PROFILE_FILE);
  const contact = profile.contacts.find((c) => c.id === req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  contact.type = type;
  contact.value = String(value).trim();
  writeDb(PROFILE_FILE, profile);
  res.json(profile);
});

// DELETE: remove a contact
app.delete('/api/profile/contacts/:id', (req, res) => {
  const profile = readDb(PROFILE_FILE);
  profile.contacts = profile.contacts.filter((c) => c.id !== req.params.id);
  writeDb(PROFILE_FILE, profile);
  res.json(profile);
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
