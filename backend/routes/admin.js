const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin routes (protected by auth middleware in server.js)
router.get('/stats', adminController.dashboardStats);
router.get('/complaints', adminController.getAllComplaints);
router.put('/complaints/:id', adminController.updateComplaintStatus);
router.get('/villagers', adminController.getAllVillagers);
router.delete("/villagers/:id", adminController.deleteVillager);
router.get('/charts', adminController.getChartData);
router.get("/complaints/:id/details", adminController.getComplaintDetails);

module.exports = router;
