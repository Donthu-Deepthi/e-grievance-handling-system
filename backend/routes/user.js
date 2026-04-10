const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes (protected by auth middleware in server.js)
router.get('/stats', userController.getStats);
router.get('/my-complaints', userController.getMyComplaints);
router.delete('/my-complaints/:id', userController.deleteMyComplaint);
router.get('/dashboard', userController.getDashboardData);
router.post('/complaints', userController.createComplaint);
router.put('/complaints/:id', userController.updateComplaint);
router.delete('/complaints/:id', userController.deleteComplaint);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.delete('/delete-account', userController.deleteAccount);
router.get('/profile', userController.getProfile);
router.get('/officials', userController.getOfficials);
router.get("/all-complaints", userController.getAllComplaintsForUsers);

module.exports = router;
