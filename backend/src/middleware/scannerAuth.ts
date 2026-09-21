import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";

interface ScannerTokenPayload {
  id: string;
  role: string;
  isAdmin: boolean;
  purpose: string;
}

export const scannerAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Scanner authentication required",
      });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization header",
      });
      return;
    }

    const decoded = Jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as ScannerTokenPayload;

    // Must be ADMIN
    if (decoded.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Admin scanner access required",
      });
      return;
    }

    // Must be a scanner token
    if (decoded.purpose !== "SCANNER") {
      res.status(403).json({
        success: false,
        message: "Invalid scanner token",
      });
      return;
    }

    // Attach user information
    (req as any).user = decoded;

    next();
  } catch (error) {
    console.error("Scanner Auth Error:", error);

    res.status(401).json({
      success: false,
      message: "Scanner session expired or invalid",
    });
  }
};
