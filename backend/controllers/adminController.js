const sequelize = require('../config/database');
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const User = require('../models/User')(sequelize, DataTypes);
const Complaint = require('../models/Complaint')(sequelize, DataTypes);
const { Op } = Sequelize;

// GET /api/admin/dashboard
// GET /api/admin/stats
exports.dashboardStats = async (req, res) => {
    try {

        const stats = await Complaint.findAll({
            attributes: [
                [sequelize.fn("COUNT", sequelize.col("id")), "total"],

                [sequelize.fn("SUM",
                    sequelize.literal("CASE WHEN status='pending' THEN 1 ELSE 0 END")
                ), "pending"],

                [sequelize.fn("SUM",
                    sequelize.literal("CASE WHEN status='inprogress' THEN 1 ELSE 0 END")
                ), "inprogress"],

                [sequelize.fn("SUM",
                    sequelize.literal("CASE WHEN status='resolved' THEN 1 ELSE 0 END")
                ), "resolved"]
            ],
            raw: true
        });

        res.json({
            success: true,
            total: Number(stats[0].total),
            pending: Number(stats[0].pending),
            inprogress: Number(stats[0].inprogress),
            resolved: Number(stats[0].resolved)
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load dashboard stats"
        });
    }
};

// GET /api/admin/complaints
// ================================
// GET ALL COMPLAINTS (ADMIN)
// ================================
exports.getAllComplaints = async (req, res) => {
    try {

        const sequelize = require('../config/database');
        const Sequelize = require('sequelize');
        const DataTypes = Sequelize.DataTypes;

        const Complaint = require('../models/Complaint')(sequelize, DataTypes);
        const User = require('../models/User')(sequelize, DataTypes);

        // relation
        Complaint.belongsTo(User, { foreignKey: "userId" });

        const complaints = await Complaint.findAll({
            include: [{
                model: User,
                attributes: ["username", "mobile"]
            }],
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



// GET /api/admin/villagers
exports.getAllVillagers = async (req, res) => {
    try {

        const villagers = await User.findAll({
            where: { role: "user" },   // only villagers
            attributes: ['id', 'username', 'mobile', 'location', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, villagers });

    } catch (error) {
        console.error("Fetch villagers error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch villagers"
        });
    }
};

// DELETE VILLAGER + HIS COMPLAINTS
exports.deleteVillager = async (req, res) => {
    try {
        const { id } = req.params;

        const sequelize = require('../config/database');
        const Sequelize = require('sequelize');
        const DataTypes = Sequelize.DataTypes;

        const User = require('../models/User')(sequelize, DataTypes);
        const Complaint = require('../models/Complaint')(sequelize, DataTypes);

        // 1. Delete all complaints of user
        await Complaint.destroy({
            where: { userId: id }
        });

        // 2. Delete user
        const deleted = await User.destroy({
            where: { id, role: "user" }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Villager not found"
            });
        }

        res.json({
            success: true,
            message: "Villager and related complaints deleted successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Delete failed"
        });
    }
};

// PUT /api/admin/complaints/:id/status
// ================================
// UPDATE COMPLAINT STATUS
// ================================
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "inprogress", "resolved"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const [updatedRows] = await Complaint.update(
            { status },
            { where: { id } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.json({
            success: true,
            message: "Status updated successfully"
        });

    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status"
        });
    }
};

// DELETE /api/admin/complaints/:id
exports.deleteComplaint = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findByPk(id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        await complaint.destroy();
        res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete complaint' });
    }
};


// POST /api/admin/complaints/bulk-status
exports.bulkUpdateStatus = async (req, res) => {
    try {
        const { complaintIds, status } = req.body;

        const validStatuses = ['pending', 'inprogress', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const updatedRows = await Complaint.update(
            { status },
            { where: { id: { [Op.in]: complaintIds } } }
        );

        res.json({
            success: true,
            message: `${updatedRows} complaints updated to ${status}`,
            updatedCount: updatedRows
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update complaints' });
    }
};

// ================================
// COMPLAINT CHART DATA
// GET /api/admin/charts
// ================================
exports.getChartData = async (req, res) => {
    try {

        const stats = await Complaint.findAll({
            attributes: [
                [sequelize.fn("COUNT", sequelize.literal("CASE WHEN status='pending' THEN 1 END")), "pending"],
                [sequelize.fn("COUNT", sequelize.literal("CASE WHEN status='inprogress' THEN 1 END")), "inprogress"],
                [sequelize.fn("COUNT", sequelize.literal("CASE WHEN status='resolved' THEN 1 END")), "resolved"]
            ],
            raw: true
        });

        res.json({
            success: true,
            pending: stats[0].pending || 0,
            inprogress: stats[0].inprogress || 0,
            resolved: stats[0].resolved || 0
        });

    } catch (err) {
        console.error("Chart data error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to load chart data"
        });
    }
};

// ================================
// GET SINGLE COMPLAINT DETAILS
// GET /api/admin/complaints/:id/details
// ================================
// ================================
// GET SINGLE COMPLAINT DETAILS
// GET /api/admin/complaints/:id/details
// ================================
exports.getComplaintDetails = async (req, res) => {
    try {

        const { id } = req.params;

        // IMPORTANT: define relation
        Complaint.belongsTo(User, { foreignKey: "userId" });

        const complaint = await Complaint.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ["username", "mobile", "location"]
            }]
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found"
            });
        }

        res.json({
            success: true,
            complaint
        });

    } catch (err) {
        console.error("Complaint details error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to load complaint details"
        });
    }
};