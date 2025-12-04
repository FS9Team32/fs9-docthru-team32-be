import bcrypt from "bcrypt";
import authRepo from "../repository/auth.repo.js";
import jwt from "jsonwebtoken"


const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_EXPIRES = process.env.JWT_TOKEN_EXPIRES_IN || "1h";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";


async function createUser(user) {
    try{
        const existedUser = await authRepo.findByEmail(user.email);
        if (existedUser) {
            const error = new Error("Email Already Exists");
            error.code = 409;
            error.data = {email: user.email};
            throw error;
        }
    const hashedPassword = await hashPassword(user.password);
    const createdUser = await authRepo.save({
        ...user,
        password: hashedPassword,
        });    
        return filterSensitiveUserData(createdUser);
    } catch (error){
        if (error.code === 409) throw error;
        const customError = new Error ("DB Error Accured");
        customError.code = 500;
        throw customError;
    }
}
    function hashPassword(password) {
    return bcrypt.hash(password, 10);
    }

    function filterSensitiveUserData(user) {
    const { password, ...rest } = user;
    return rest;
}
async function getUser(email, password) {
    try {
        const user = await authRepo.findByEmail(email);
    if (!user){
            const error = new Error("Email Does Not Exists");
            error.code = 401;
            throw error;
        }
        await verifyPassword(password, user.password);
        return filterSensitiveUserData(user);
    } catch (error) {
        if (error.code === 401) throw error;
        const customError = new Error("DB Error Accured");
        customError.code = 500;
        throw customError;
    }
}

    async function verifyPassword(inputPassword, password) {
    const isMatch = await bcrypt.compare(inputPassword, password);
    if (!isMatch) {
        const error = new Error("Incorrect Password");
        error.code = 401;
        throw error;
    }
}

function createToken(user, type) {
    const payload = { userId: user.id };
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: type === "refresh" ? REFRESH_EXPIRES : JWT_EXPIRES,
    });
    return token;
}

async function updateUser(id, data) {
    const updatedUser = await authRepo.update(id, data);
    return filterSensitiveUserData(updatedUser);
}

async function refreshToken(userId, refreshToken) {
    const user = await authRepo.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
        const error = new Error("Unauthorized");
        error.code = 401;
        throw error;
    }

    const newAccessToken = createToken(user);
    const newRefreshToken = createToken(user, "refresh");
    return { newAccessToken, newRefreshToken };
}


export default{
    createUser,
    getUser,
    updateUser,
    createToken,
    refreshToken,
};

