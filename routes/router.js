import express from "express";
import {
  RegisterUser,
  LoginUser,
  CompleteUserProfile,
  FetchPosts,
  SharePost,
  ReportPost,
  GetAllReportPostsAuthenticated,
  GetAllReportPostsByUserId,
  SavePost,
  LoggedInUserSavedPosts,
  GetAllSavedPostsByUserId,
  GetAuthenticatedUser,
  GetUserDetails,
  GetAllUsers,
  UpdateUserCredits,
} from "../controllers/UserController.js"; // Adjust path as needed
import { verifyUser } from "../middleware/UserMiddleware.js"; // Adjust path as needed

const router = express.Router();

// Authentication
router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.patch("/complete", verifyUser, CompleteUserProfile);

// Feed Aggregator
router.get("/posts", FetchPosts);
router.post("/share/:postId", verifyUser, SharePost);
router.post("/report/:postId", verifyUser, ReportPost);
router.post("/save/:postId", verifyUser, SavePost);

// User Dashboard
router.get("/user", verifyUser, GetAuthenticatedUser);
router.get("/reports", verifyUser, GetAllReportPostsAuthenticated);
router.get("/saved", verifyUser, LoggedInUserSavedPosts);

// Admin Panel
router.get("/users", verifyUser, GetAllUsers);
router.get("/user/:userId", verifyUser, GetUserDetails);
router.get("/reports/:userId", verifyUser, GetAllReportPostsByUserId);
router.get("/saved/:userId", verifyUser, GetAllSavedPostsByUserId);
router.patch("/credits/:userId", verifyUser, UpdateUserCredits);

export default router;