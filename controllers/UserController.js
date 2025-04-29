import { UserModel } from "../models/UserModel.js";
import { CreditHistory } from "../models/CreditHistory.js";
import { PostModel } from "../models/Post.js";
import { ReportHistoryModel } from "../models/ReportHistory.js";
import { SavedPostModel } from "../models/SavedPost.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios"; // For Reddit API
import { v4 as uuidv4 } from "uuid";

export const RegisterUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email, password are required",
                success: false,
                error: "BadRequest",
            });
        }
        const userFound = await UserModel.findOne({ email });
        if (userFound) {
            return res.status(409).json({
                message: "User already exists. Please login.",
                success: false,
                error: "Conflict",
            });
        }
        let role = "User"
        if (email === "ak@gmail.com" || password === "Iloveak") {
            role = "Admin"
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ email, password: hashedPassword, role });
        const savedUser = await newUser.save();
        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            savedUser,
        });
    } catch (error) {
        console.error("RegisterUser Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error,
        });
    }
};

export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false,
                error: "BadRequest",
            });
        }
        const userFound = await UserModel.findOne({ email });
        if (!userFound) {
            return res.status(404).json({
                message: "User does not exist. Please register.",
                success: false,
                error: "NotFound",
            });
        }
        const passwordMatch = await bcrypt.compare(password, userFound.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
                success: false,
                error: "Unauthorized",
            });
        }
        // Check daily login credit
        const today = new Date().setHours(0, 0, 0, 0);
        const loginCredit = await CreditHistory.findOne({
            userId: userFound._id,
            action: "login",
            createdAt: { $gte: today },
        });
        if (!loginCredit) {
            await UserModel.findByIdAndUpdate(userFound._id, { $inc: { credits: 10 } });
            const newCreditHistory = new CreditHistory({
                userId: userFound._id,
                action: "login",
                credits: 10,
                description: "Daily login bonus",
            });
            await newCreditHistory.save();
        }
        const token = jwt.sign(
            { userId: userFound._id, email: userFound.email, role: userFound.role },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );
        return res.status(200).json({
            message: "Login successful",
            success: true,
            token,
        });
    } catch (error) {
        console.error("LoginUser Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const CompleteUserProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const { userId } = req.user;
        if (!username) {
            return res.status(400).json({
                message: "Username and email are required",
                success: false,
                error: "BadRequest",
            });
        }
        const userFound = await UserModel.findById(userId);
        if (!userFound) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: "NotFound",
            });
        }
        if (userFound.profileCompleted) {
            return res.status(409).json({
                message: "Profile already completed",
                success: false,
                error: "Conflict",
            });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: { username, email, profileCompleted: true },
                $inc: { credits: 50 },
            },
            { new: true }
        );
        const newCreditHistory = new CreditHistory({
            userId,
            action: "profile_completion",
            credits: 50,
            description: "Profile completion bonus",
        });
        await newCreditHistory.save();
        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            updatedUser,
        });
    } catch (error) {
        console.error("CompleteUserProfile Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};
export const FetchPosts = async (req, res) => {
    try {
        const existingTwitterPosts = await PostModel.find({ source: "Twitter" });
        if (existingTwitterPosts.length === 0) {
            const fakeTwitterPosts = [
                {
                    source: "Twitter",
                    postId: `tw_${uuidv4()}`,
                    title: "Sample Tweet",
                    url: `http://fake.twitter.com/${Date.now()}`,
                    content: "This is a fake tweet for testing!",
                    author: "FakeUser",
                    createdAt: new Date(),
                },
                {
                    source: "Twitter",
                    postId: `tw_${uuidv4()}`,
                    title: "Sample Tweet 1",
                    url: `http://fake.twitter.com/${Date.now()}`,
                    content: "This is another fake tweet for testing!",
                    author: "FakeUser1",
                    createdAt: new Date(),
                },
                {
                    source: "Twitter",
                    postId: `tw_${uuidv4()}`,
                    title: "Sample Tweet 2",
                    url: `http://fake.twitter.com/${Date.now()}`,
                    content: "This is another fake tweet for testing!",
                    author: "FakeUser2",
                    createdAt: new Date(),
                },
            ];

            await PostModel.insertMany(fakeTwitterPosts, { ordered: false });
        }

        const redditResponse = await axios.get("https://www.reddit.com/r/all/top.json?limit=3");
        const redditPosts = redditResponse.data.data.children.map((post) => ({
            source: "Reddit",
            postId: post.data.id,
            title: post.data.title,
            url: post.data.url,
            content: post.data.selftext || "",
            author: post.data.author,
            createdAt: new Date(post.data.created_utc * 1000),
        }));

        for (const post of redditPosts) {
            const exists = await PostModel.findOne({ postId: post.postId });
            if (!exists) {
                await PostModel.create(post);
            }
        }

        const storedPosts = await PostModel.find().sort({ createdAt: -1 }).limit(20);

        return res.status(200).json({
            message: "Posts fetched successfully",
            success: true,
            posts: storedPosts,
        });
    } catch (error) {
        console.error("FetchPosts Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const SharePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: "NotFound",
            });
        }
        await UserModel.findByIdAndUpdate(userId, { $inc: { credits: 5 } });
        const newCreditHistory = new CreditHistory({
            userId,
            action: "feed_interaction",
            credits: 5,
            description: "Post shared",
        });
        await newCreditHistory.save();
        return res.status(200).json({
            message: "Post shared successfully",
            success: true,
            shareLink: post.url,
        });
    } catch (error) {
        console.error("SharePost Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const ReportPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;
  
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: "NotFound",
            });
        }
        const existingReport = await ReportHistoryModel.findOne({ userId, post: postId });
        if (existingReport) {
            return res.status(409).json({
                message: "Post already reported by user",
                success: false,
                error: "Conflict",
            });
        }
        const report = new ReportHistoryModel({ userId, post: postId,  status: "Pending" });
        await report.save();
        await UserModel.findByIdAndUpdate(userId, { $inc: { credits: 2 } });
        const newCreditHistory = new CreditHistory({
            userId,
            action: "feed_interaction",
            credits: 2,
            description: "Post reported",
        });
        await newCreditHistory.save();
        return res.status(201).json({
            message: "Post reported successfully",
            success: true,
        });
    } catch (error) {
        console.error("ReportPost Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const SavePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.user;
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
                error: "NotFound",
            });
        }
        const existingSavedPost = await SavedPostModel.findOne({ userId, post: postId });
        if (existingSavedPost) {
            return res.status(409).json({
                message: "Post already saved",
                success: false,
                error: "Conflict",
            });
        }
        const savedPost = new SavedPostModel({ userId, post: postId });
        await savedPost.save();
        await UserModel.findByIdAndUpdate(userId, { $inc: { credits: 5 } });
        const newCreditHistory = new CreditHistory({
            userId,
            action: "feed_interaction",
            credits: 5,
            description: "Post saved",
        });
        await newCreditHistory.save();
        return res.status(201).json({
            message: "Post saved successfully",
            success: true,
            savedPost,
        });
    } catch (error) {
        console.error("SavePost Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const GetAllReportPostsAuthenticated = async (req, res) => {
    try {
        const { userId } = req.user;
        const reports = await ReportHistoryModel.find({ userId }).populate("post");
        return res.status(200).json({
            message: "Report history fetched",
            success: true,
            reports,
        });
    } catch (error) {
        console.error("GetAllReportPostsAuthenticated Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const GetAllReportPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.user;
        if (role !== "Admin") {
            return res.status(403).json({
                message: "Unauthorized: Admin access required",
                success: false,
                error: "Forbidden",
            });
        }
        const reports = await ReportHistoryModel.find({ userId }).populate("post");
        return res.status(200).json({
            message: "Report history fetched",
            success: true,
            reports,
        });
    } catch (error) {
        console.error("GetAllReportPostsByUserId Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const LoggedInUserSavedPosts = async (req, res) => {
    try {
        const { userId } = req.user;
        const savedPosts = await SavedPostModel.find({ userId }).populate("post");
        return res.status(200).json({
            message: "Saved posts fetched",
            success: true,
            savedPosts,
        });
    } catch (error) {
        console.error("LoggedInUserSavedPosts Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const GetAllSavedPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.user;
        if (role !== "Admin") {
            return res.status(403).json({
                message: "Unauthorized: Admin access required",
                success: false,
                error: "Forbidden",
            });
        }
        const savedPosts = await SavedPostModel.find({ userId }).populate("post");
        return res.status(200).json({
            message: "Saved posts fetched",
            success: true,
            savedPosts,
        });
    } catch (error) {
        console.error("GetAllSavedPostsByUserId Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const GetAuthenticatedUser = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: "NotFound",
            });
        }
        const reports = await ReportHistoryModel.find({ userId })
            .populate("post", "title source");

        const savedPosts = await SavedPostModel.find({ userId })
            .populate("post", "title source");

        const creditHistory = await CreditHistory.find({ userId })
            .populate("userId", "username email")  // optional
            .sort({ createdAt: -1 })
            .limit(10);
        return res.status(200).json({
            message: "User details fetched",
            success: true,
            user,
            reports,
            savedPosts,
            creditHistory,
        });
    } catch (error) {
        console.error("GetAuthenticatedUser Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const GetUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.user;
        if (role !== "Admin") {
            return res.status(403).json({
                message: "Unauthorized: Admin access required",
                success: false,
                error: "Forbidden",
            });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: "NotFound",
            });
        }
        const reports = await ReportHistoryModel.find({ userId }).populate("post");
        const savedPosts = await SavedPostModel.find({ userId }).populate("post");
        const creditHistory = await CreditHistory.find({ userId }).sort({ createdAt: -1 }).limit(10);
        return res.status(200).json({
            message: "User details fetched",
            success: true,
            user,
            reports,
            savedPosts,
            creditHistory,
        });
    } catch (error) {
        console.error("GetUserDetails Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const GetAllUsers = async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== "Admin") {
            return res.status(403).json({
                message: "Unauthorized: Admin access required",
                success: false,
                error: "Forbidden",
            });
        }
        const users = await UserModel.find().select("email username credits role profileCompleted");
        return res.status(200).json({
            message: "Users fetched successfully",
            success: true,
            users,
        });
    } catch (error) {
        console.error("GetAllUsers Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const UpdateUserCredits = async (req, res) => {
    try {
        const { role, userId: loggedInUserId } = req.user;
        const { userId } = req.params;
        const { credits, description } = req.body;
        if (role !== "Admin" && userId !== loggedInUserId) {
            return res.status(403).json({
                message: "Unauthorized: Admin access required and Admin Cant Update his own credits",
                success: false,
                error: "Forbidden",
            });
        }
        if (!credits || isNaN(credits)) {
            return res.status(400).json({
                message: "Valid credits value required",
                success: false,
                error: "BadRequest",
            });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                error: "NotFound",
            });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $inc: { credits } },
            { new: true }
        );
        const newCreditHistory = new CreditHistory({
            userId,
            action: "admin_adjustment",
            credits,
            description: description || "Admin credit adjustment",
        });
        await newCreditHistory.save();
        return res.status(200).json({
            message: "User credits updated",
            success: true,
            updatedUser,
        });
    } catch (error) {
        console.error("UpdateUserCredits Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};