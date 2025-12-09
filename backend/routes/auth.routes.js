// AUTHENTICATION ROUTES

import express from 'express';
import {
    changePassword,
    getProfile,
    login,
    logout,
    resendOTP,
    signup,
    updateProfile,
    verifyOTP
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
    changePasswordValidation,
    loginValidation,
    otpValidation,
    resendOTPValidation,
    signupValidation,
    updateProfileValidation,
    validate
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.post('/verify-otp', otpValidation, validate, verifyOTP);
router.post('/resend-otp', resendOTPValidation, validate, resendOTP);

// Protected routes (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);
router.post('/logout', protect, logout);

export default router;