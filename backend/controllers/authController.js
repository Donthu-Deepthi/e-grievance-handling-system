const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const User = require('../models/User')(sequelize, DataTypes);
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { username, mobile, password, location } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { mobile } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Mobile number already registered' });
        }

        const user = await User.create({
            username,
            mobile,
            password,
            location,
            role: 'user'
        });

        req.session.userId = user.id;
        req.session.role = user.role;

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const user = await User.findOne({ where: { mobile } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.role = user.role;

        res.json({
            success: true,
            role: user.role,
            user: {
                id: user.id,
                username: user.username,
                mobile: user.mobile,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
};
