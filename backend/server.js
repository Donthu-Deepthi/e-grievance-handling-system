const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const cors = require('cors');
const helmet = require('helmet');
const path = require("path");
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    })
);

app.use(cors({
    credentials: true,
    origin: [
        'http://127.0.0.1:5500'
    ]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(
    "/uploads",
    express.static(path.join(__dirname, "../frontend/uploads"))
);

/* ---------------- SESSION STORE ---------------- */

const store = new SequelizeStore({
    db: sequelize,
});
store.sync();
app.set('trust proxy', 1);

app.use(session({
    name: 'ghsid',
    secret: "secret123",
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
}));

/* ---------------- AUTH MIDDLEWARES ---------------- */

const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    req.userId = req.session.userId;
    req.role = req.session.role;
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin only' });
    }
    next();
};

/* ---------------- ROUTES ---------------- */

app.use('/api/auth', authRoutes);
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes);
app.use('/api/user', requireAuth, userRoutes);

/* ---------------- MODELS ---------------- */

const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const User = require('./models/User')(sequelize, DataTypes);
const Complaint = require('./models/Complaint')(sequelize, DataTypes);

// Relations
User.associate({ Complaint });
Complaint.associate({ User });

/* ---------------- AUTH CHECK ---------------- */

app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: ['id', 'username', 'mobile', 'role']
        });
        res.json({ success: true, user: user ? user.toJSON() : null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/* ---------------- START SERVER ---------------- */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

sequelize.sync({ alter: true })
    .then(() => {
        console.log('DB Tables Created/Updated');
        console.log('Server running on http://localhost:5000');
        app.listen(5000);
    })
    .catch(err => console.error('Database sync failed:', err));