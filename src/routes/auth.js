import express from 'express';
import { expressjwt } from "express-jwt";
import authService from '../services/auth.service.js';
import auth from "../middlewares/auth.js";

const authRouter = express.Router();

const verifyAccessToken = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
});


authRouter.post("/signup", async (req, res, next) => {
    try {
        const { email, nickname, password } = req.body;
        if (!email || !nickname || !password) {
        const error = new Error("email, nickname, password 가 모두 필요합니다.");
        error.code = 400;
        throw error;
        }
        const user = await authService.createUser({ email, nickname, password });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});


authRouter.post ("/login", async(req, res, next) => {
    const {email, password} = req.body;
    try {
        if (!email || !password) {
            const error = new Error ("Requires both email and Password");
            error.code = 400;
            throw error;
        }
        const user = await authService.getUser(email,password);
        req.session.userId = user.id;
        res.json(user);
    } catch (error) {
        next(error);
    }
})

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
            sameSite: "none",
            secure: true,
            path: "/token/refresh",
        });
        return res.json({ accessToken: newAccessToken });
        } catch (error) {
        return next(error);
        }
    },
);

export default authRouter;