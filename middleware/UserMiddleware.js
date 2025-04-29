import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { configDotenv } from "dotenv";

configDotenv()

export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing or malformed",
        success: false,
        error: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: "NotFound",
      });
    }
    if (user.email !== decoded.email) {
      return res.status(403).json({
        message: "Unauthorized action",
        success: false,
        error: "Forbidden",
      });
    }

    // Attach user data in the format expected by controllers
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    console.error("verifyUser Error:", error);
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired token",
        success: false,
        error: "Unauthorized",
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};