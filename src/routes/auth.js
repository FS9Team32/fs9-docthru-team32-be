import express from 'express';
import authService from '../services/auth.service.js';
import auth from "../middlewares/auth.js";

const authRouter = express.Router();


authRouter.post("/signup", async (req, res, next) => {
    try {
        const { email, nickname, password } = req.body;
        if (!email || !nickname || !password) {
        const error = new Error("All Input Is Required");
        error.code = 400;
        throw error;
        }
        const user = await authService.createUser({ email, nickname, password });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

authRouter.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    try {
    if (!email || !password) {
        const error = new Error("Email And Password Is Required");
        error.code = 400;
        throw error;
    }
    const user = await authService.getUser(email, password);

    const accessToken = authService.createToken(user);
    const refreshToken = authService.createToken(user, "refresh");
    await authService.updateUser(user.id, { refreshToken });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    });
    res.json({ ...user, accessToken });
    } catch (error) {
        next(error);
    }
});

authRouter.post(
    "/token/refresh",
    auth.verifyRefreshToken,
    async (req, res, next) => {
        try {
        const refreshToken = req.cookies.refreshToken;
        const { userId } = req.auth;
        const { newAccessToken, newRefreshToken } =
            await authService.refreshToken(userId, refreshToken);
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            path: "/token/refresh",
        });
        return res.json({ accessToken: newAccessToken });
        } catch (error) {
        return next(error);
        }
    },
);

export default authRouter;