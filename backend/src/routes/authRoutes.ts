import express from "express";

import {
  userLogin,
  userLogout,
  userRegister,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  forgotPassword,
  resetPassword,
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  scannerLogin,
} from "../controllers/UserController";

import { protect } from "../middleware/authmiddleware";

const router = express.Router();

router.post("/auth/register", userRegister);

router.post("/auth/verify-registration-otp", verifyRegistrationOtp);

router.post("/auth/resend-registration-otp", resendRegistrationOtp);

router.post("/auth/login", userLogin);

router.post("/auth/forgot-password", forgotPassword);

router.post("/auth/reset-password", resetPassword);

router.post("/auth/logout", protect, userLogout);



//Admin Auth

router.post("/auth/admin/login", adminLogin);
router.post("/scanner/login", scannerLogin)
router.post("/auth/admin/forgot-password", adminForgotPassword);
router.post("/auth/admin/reset-password", adminResetPassword);

export default router;
