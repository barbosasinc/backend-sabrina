const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../connect/connect');

// In-memory sample data for demo purposes
let items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
];

// GET all items
router.get('/items', (req, res) => {
    res.json(items);
});

// GET item by ID
router.get('/items/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
});

// POST new item
router.post('/items', (req, res) => {
    const item = {
        id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1,
        name: req.body.name
    };
    items.push(item);
    res.status(201).json(item);
});

// PUT update item
router.put('/items/:id', (req, res) => {
    const item = items.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.name = req.body.name;
    res.json(item);
});

// DELETE item
router.delete('/items/:id', (req, res) => {
    const index = items.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Item not found' });
    const deleted = items.splice(index, 1);
    res.json(deleted[0]);
});

router.get('/connect', (req, res) => {
    const db = require('../connect/connect');
    if (db){
        console.log('Database connection pool created successfully');
        res.send({ message: 'Database connection pool created successfully', status: true });
    } else {
        console.log('Failed to create database connection pool');
        res.status(500).send({ message: 'Failed to create database connection pool', status: false });
    }
    
});

// POST /login - authenticate user with bcrypt-hashed password
router.post('/login', (req, res) => {
    const user = req.body.user || req.body.username;
    const password = req.body.password;
    if (!user || !password) return res.status(400).json({ message: 'Missing credentials', status: false });
    console.log(`Login attempt for user: ${user}`);
    db.query('SELECT * FROM tb_usuarios WHERE usuario = ?', [user], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Database error', status: false });
        }
        if (results.length === 0) {
            console.log('Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials', status: false });
        }
        const row = results[0];
        try {
            const match = await bcrypt.compare(password, row.senha);
            if (!match) return res.status(401).json({ message: 'Invalid credentials', status: false });
            req.session.user = { usuario: row.usuario, email: row.email, role: row.role, nome: row.nome };
            console.log('Login successful');
            return res.json({ message: 'Login successful', status: true, user: req.session.user });
        } catch (e) {
            console.error('Bcrypt error:', e);
            return res.status(500).json({ message: 'Server error', status: false });
        }
    });
});

// POST /signup - create a new user with hashed password
router.post('/signup', async (req, res) => {
    const user = req.body.user || req.body.username;
    const password = req.body.password;
    const email = req.body.email || '';
    const role = req.body.role || 'user';
    const name = req.body.name || '';

    if (!user || !password) return res.status(400).json({ message: 'Missing fields', status: false });

    try {
        const hashed = await bcrypt.hash(password, 10);
        db.query('INSERT INTO tb_usuarios (usuario, senha, email, role, nome) VALUES (?, ?, ?, ?, ?)', [user, hashed, email, role, name], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                // handle duplicate user error gracefully
                if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'User already exists', status: false });
                return res.status(500).json({ message: 'Database error', status: false });
            }
            console.log('User created successfully');
            return res.json({ message: 'User created successfully', status: true });
        });
    } catch (e) {
        console.error('Hashing error:', e);
        return res.status(500).json({ message: 'Server error', status: false });
    }
});

// POST /logout - destroy session
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Logout failed', status: false });
        }
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out', status: true });
    });
});

// GET /user - return current logged-in user
router.get('/user', (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ username: req.session.user.usuario });
    }
    return res.status(401).json({ message: 'Not authenticated' });
});

module.exports = router;
