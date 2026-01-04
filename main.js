const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Sample data
let items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
];

// GET all items
app.get('/api/items', (req, res) => {
    res.json(items);
});

// GET item by ID
app.get('/api/items/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
});

// POST new item
app.post('/api/items', (req, res) => {
    const item = {
        id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1,
        name: req.body.name
    };
    items.push(item);
    res.status(201).json(item);
});

// PUT update item
app.put('/api/items/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.name = req.body.name;
    res.json(item);
});

// DELETE item
app.delete('/api/items/:id', (req, res) => {
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Item not found' });
    const deleted = items.splice(index, 1);
    res.json(deleted[0]);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});