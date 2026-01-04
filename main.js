const express = require('express');
const cors = require('cors'); // Add this line

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Add this line to enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Routes
const routes = require('./routes/route');
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});