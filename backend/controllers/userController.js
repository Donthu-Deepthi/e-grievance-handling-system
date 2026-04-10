const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const User = require('../models/User')(sequelize, DataTypes);
const Complaint = require('../models/Complaint')(sequelize, DataTypes);
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../frontend/uploads/'); // Fixed path - relative to backend
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

exports.getStats = async (req, res) => {
    try {

        const total = await Complaint.count();
        const pending = await Complaint.count({ where: { status: 'pending' } });
        const inprogress = await Complaint.count({ where: { status: 'inprogress' } });
        const resolved = await Complaint.count({ where: { status: 'resolved' } });

        res.json({ success: true, total, pending, inprogress, resolved });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to load stats' });
    }
};

// ================================
// GET ALL ADMINS (OFFICIALS)
// ================================
exports.getOfficials = async (req, res) => {
    try {

        const sequelize = require('../config/database');
        const Sequelize = require('sequelize');
        const DataTypes = Sequelize.DataTypes;

        const User = require('../models/User')(sequelize, DataTypes);

        const admins = await User.findAll({
            where: { role: "admin" },
            attributes: ['id', 'username', 'mobile', 'location', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            officials: admins
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to load officials"
        });
    }
};

// GET /api/user/my-complaints
exports.getMyComplaints = async (req, res) => {
    try {

        const complaints = await Complaint.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            complaints
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to load complaints"
        });
    }
};


// ================================
// DELETE MY COMPLAINT
// ================================
exports.deleteMyComplaint = async (req, res) => {
    try {

        const { id } = req.params;

        const deleted = await Complaint.destroy({
            where: {
                id,
                userId: req.userId   // important security check
            }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.json({
            success: true,
            message: "Complaint deleted successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Delete failed"
        });
    }
};

// POST /api/user/complaints
exports.createComplaint = [
    upload.single("image"),

    async (req, res) => {
        try {

            const { title, description, location, category } = req.body;

            if (!title || !description || !location || !category) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }
            //console.log("SESSION USER:", req.session.userId);
            const complaint = await Complaint.create({

                title,
                description,
                location,
                category,
                status: "pending",
                image_url: req.file ? `/uploads/${req.file.filename}` : null,
                userId: req.session.userId

            });

            res.status(201).json({
                success: true,
                message: "Complaint submitted successfully",
                complaint
            });

        } catch (err) {
            console.error("Create complaint error:", err);

            res.status(500).json({
                success: false,
                message: "Failed to submit complaint"
            });
        }
    }
];

// GET /api/user/dashboard
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.session.userId;

        const total = await Complaint.count({ where: { userId } });
        const pending = await Complaint.count({ where: { userId, status: 'pending' } });
        const inprogress = await Complaint.count({ where: { userId, status: 'inprogress' } });
        const resolved = await Complaint.count({ where: { userId, status: 'resolved' } });

        const recentComplaints = await Complaint.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: { exclude: ['updatedAt', 'description'] }
        });

        res.json({
            total,
            pending,
            inprogress,
            resolved,
            recentComplaints
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Failed to load dashboard' });
    }
};

// PUT /api/user/complaints/:id
exports.updateComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const [updatedRows] = await Complaint.update(updates, {
            where: {
                id,
                userId: req.session.userId
            }
        });

        if (updatedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found or access denied'
            });
        }

        res.json({ success: true, message: 'Complaint updated successfully' });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ success: false, message: 'Failed to update complaint' });
    }
};

// DELETE /api/user/complaints/:id
exports.deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findOne({
            where: {
                id,
                userId: req.session.userId,
                status: 'pending'
            }
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found or cannot be deleted'
            });
        }

        await complaint.destroy();
        res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete complaint' });
    }
};

const bcrypt = require('bcryptjs');

/* ===============================
   UPDATE PROFILE
================================ */
exports.updateProfile = async (req, res) => {
    try {
        const { username, mobile, location } = req.body;

        await User.update(
            { username, mobile, location },
            { where: { id: req.session.userId } }
        );

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Profile update failed" });
    }
};

/* ===============================
   CHANGE PASSWORD
================================ */
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findByPk(req.session.userId);

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return res.status(400).json({ success: false, message: "Old password incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await User.update(
            { password: hashed },
            { where: { id: req.session.userId } }
        );

        res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Password change failed" });
    }
};

/* ===============================
   DELETE ACCOUNT
================================ */
exports.deleteAccount = async (req, res) => {
    try {
        await Complaint.destroy({
            where: { userId: req.session.userId }
        });

        await User.destroy({
            where: { id: req.session.userId }
        });

        req.session.destroy();

        res.json({ success: true, message: "Account deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Delete failed" });
    }
};

/* ===============================
   GET USER PROFILE
================================ */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['username', 'mobile', 'location']
        });

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to load profile" });
    }
};

// GET /api/user/all-complaints
exports.getAllComplaintsForUsers = async (req, res) => {
    try {

        const complaints = await Complaint.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            complaints
        });

    } catch (error) {
        console.error("All complaints fetch error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load complaints"
        });
    }
};
