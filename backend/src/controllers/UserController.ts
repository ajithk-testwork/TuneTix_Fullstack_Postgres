import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import Jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import {
  generateOtp,
  hashOtp,
  sendOtpEmail,
  sendWelcomeEmail,
} from "../utils/emailService";
import { Prisma } from "@prisma/client";

const OTP_EXPIRY_MINUTES = 10;

export const userRegister = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("========== REGISTER ==========");
    console.log(req.body);

    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !phoneNumber || !password) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });

      return;
    }

    // Basic password validation
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });

      return;
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    // If email already exists
    if (existingUser) {
      // If already verified, don't create another account
      if (existingUser.isEmailVerified) {
        res.status(409).json({
          success: false,
          message: "Email already exists. Please login.",
        });

        return;
      }

      // Existing account but email not verified
      // Delete old OTPs
      await prisma.emailOtp.deleteMany({
        where: {
          userId: existingUser.id,
          purpose: "REGISTER",
        },
      });

      // Generate new OTP
      const otp = generateOtp();

      const otpHash = hashOtp(otp);

      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await prisma.emailOtp.create({
        data: {
          userId: existingUser.id,
          codeHash: otpHash,
          purpose: "REGISTER",
          expiresAt,
        },
      });

      // Send OTP
      await sendOtpEmail(
        existingUser.name,
        existingUser.email,
        otp,
        "REGISTER",
      );

      res.status(200).json({
        success: true,
        message:
          "Your account is not verified. A new OTP has been sent to your email.",
        userId: existingUser.id,
        email: existingUser.email,
        requiresEmailVerification: true,
      });

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),

        name,

        email: normalizedEmail,

        phoneNumber,

        password: hashedPassword,

        // New accounts must verify email
        isEmailVerified: false,
      },
    });

    // Generate OTP
    const otp = generateOtp();

    // Never store plain OTP
    const otpHash = hashOtp(otp);

    // OTP expires after 10 minutes
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save OTP
    await prisma.emailOtp.create({
      data: {
        userId: user.id,

        codeHash: otpHash,

        purpose: "REGISTER",

        expiresAt,
      },
    });

    // Send OTP email
    await sendOtpEmail(user.name, user.email, otp, "REGISTER");

    res.status(201).json({
      success: true,

      message:
        "Account created successfully. Verification OTP sent to your email.",

      userId: user.id,

      email: user.email,

      requiresEmailVerification: true,
    });
  } catch (error: any) {
    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const verifyRegistrationOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: "Email is already verified",
      });

      return;
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        userId: user.id,

        purpose: "REGISTER",

        expiresAt: {
          gt: new Date(),
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP.",
      });

      return;
    }

    // Hash entered OTP
    const cleanOtp = otp.toString().trim();

    // Hash entered OTP
    const enteredOtpHash = hashOtp(otp.toString().trim());

    // DEBUG - TEMPORARY
    console.log("========== OTP DEBUG ==========");
    console.log("Email:", normalizedEmail);
    console.log("Entered OTP:", cleanOtp);
    console.log("OTP Purpose:", otpRecord.purpose);
    console.log("OTP Created At:", otpRecord.createdAt);
    console.log("OTP Expires At:", otpRecord.expiresAt);
    console.log("Current Time:", new Date());
    console.log("Is Expired:", otpRecord.expiresAt <= new Date());
    console.log("Entered Hash:", enteredOtpHash);
    console.log("Stored Hash:", otpRecord.codeHash);
    console.log("Hash Match:", enteredOtpHash === otpRecord.codeHash);
    console.log("================================");

    // Compare
    if (enteredOtpHash !== otpRecord.codeHash) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

      return;
    }

    // Verify user + remove OTP
    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          isEmailVerified: true,
        },
      }),

      prisma.emailOtp.deleteMany({
        where: {
          userId: user.id,
          purpose: "REGISTER",
        },
      }),
    ]);

    // Send welcome email
    await sendWelcomeEmail(user.name, user.email);

    res.status(200).json({
      success: true,
      message: "Email verified successfully. Welcome to TuneTix!",
    });
  } catch (error: any) {
    console.error("Verify Registration OTP Error:", error);

    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const resendRegistrationOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });

      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: "Email is already verified",
      });

      return;
    }

    // Delete old OTP
    await prisma.emailOtp.deleteMany({
      where: {
        userId: user.id,
        purpose: "REGISTER",
      },
    });

    // Generate new OTP
    const otp = generateOtp();

    const otpHash = hashOtp(otp);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        userId: user.id,
        codeHash: otpHash,
        purpose: "REGISTER",
        expiresAt,
      },
    });

    await sendOtpEmail(user.name, user.email, otp, "REGISTER");

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error: any) {
    console.error("Resend OTP Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and Password are Required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not Found!",
      });
      return;
    }

    if (user.role !== "USER") {
      res.status(403).json({
        success: false,
        message: "Please use the admin login",
      });
      return;
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        requiresEmailVerification: true,
        email: user.email,
      });

      return;
    }

    const token = Jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "User Login Failed",
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    // Don't reveal whether the email exists
    if (!user) {
      res.status(200).json({
        success: true,
        message: "If the account exists, a password reset OTP has been sent.",
      });

      return;
    }

    // Remove old reset OTP
    await prisma.emailOtp.deleteMany({
      where: {
        userId: user.id,
        purpose: "FORGOT_PASSWORD",
      },
    });

    const otp = generateOtp();

    const otpHash = hashOtp(otp);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        userId: user.id,
        codeHash: otpHash,
        purpose: "FORGOT_PASSWORD",
        expiresAt,
      },
    });

    await sendOtpEmail(user.name, user.email, otp, "FORGOT_PASSWORD");

    res.status(200).json({
      success: true,
      message: "If the account exists, a password reset OTP has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process password reset",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });

      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid password reset request",
      });

      return;
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        userId: user.id,

        purpose: "FORGOT_PASSWORD",

        expiresAt: {
          gt: new Date(),
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP.",
      });

      return;
    }

    const enteredOtpHash = hashOtp(otp.toString().trim());

    if (enteredOtpHash !== otpRecord.codeHash) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          password: hashedPassword,
        },
      }),

      prisma.emailOtp.deleteMany({
        where: {
          userId: user.id,
          purpose: "FORGOT_PASSWORD",
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

export const adminLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and Password are Require",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin account required.",
      });
      return;
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        requiresEmailVerification: true,
        email: user.email,
      });

      return;
    }

    const token = Jwt.sign(
      {
        id: user.id,
        role: user.role,
        isAdmin: true,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      success: true,
      message: "Admin Login Successfully",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Admin Login Failed",
    });
  }
};

export const scannerLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid scanner credentials",
      });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Scanner access denied",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid scanner credentials",
      });
      return;
    }

    const token = Jwt.sign(
      {
        id: user.id,
        role: user.role,
        isAdmin: true,
        purpose: "SCANNER",
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "12h",
      },
    );

    res.status(200).json({
      success: true,
      message: "Scanner login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Scanner Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Scanner login failed",
      error: error.message,
    });
  }
};

export const adminForgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Admin email is required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      res.status(200).json({
        success: false,
        message:
          "If the admin account exists, a password reset OTP has been sent.",
      });
      return;
    }

    await prisma.emailOtp.deleteMany({
      where: {
        userId: user.id,
        purpose: "FORGOT_PASSWORD",
      },
    });

    const otp = generateOtp();

    const otpHash = hashOtp(otp);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        userId: user.id,
        codeHash: otpHash,
        purpose: "FORGOT_PASSWORD",
        expiresAt,
      },
    });

    await sendOtpEmail(user.name, user.email, otp, "FORGOT_PASSWORD");

    res.status(200).json({
      success: true,
      message:
        "If the admin account exists, a password reset OTP has been sent.",
    });
  } catch (error) {
    console.log("Admin Forgot Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Unabl to process admin password reset",
    });
  }
};

export const adminResetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Admin email, OTP and new password are required",
      });

      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });

      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      res.status(400).json({
        success: false,
        message: "Invalid admin password reset request",
      });

      return;
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        userId: user.id,

        purpose: "FORGOT_PASSWORD",

        expiresAt: {
          gt: new Date(),
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP.",
      });

      return;
    }

    const enteredOtpHash = hashOtp(otp.toString().trim());

    if (enteredOtpHash !== otpRecord.codeHash) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          password: hashedPassword,
        },
      }),

      prisma.emailOtp.deleteMany({
        where: {
          userId: user.id,
          purpose: "FORGOT_PASSWORD",
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Admin password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Admin Reset Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Admin password reset failed",
    });
  }
};

export const userLogout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Logout Failed",
    });
  }
};
