import { getHash, simulateLatency } from './helpers.js';

const _fakeDbPath = './data/users.json';

export async function loginUser(email, password) {
    try {
        await simulateLatency();

        if (!password || !email) {
            throw new Error("Invalid email or password");
        }

        let existingUsers = {};
        try {
            existingUsers = await _getUsers();
        } catch (dbErr) {
            console.error("DB Error:", dbErr.message);
            throw new Error("Login service is temporarily unavailable");
        }

        const user = existingUsers.find(u => u.email === email);

        if (!user || !user.password) {
            throw new Error("Invalid email or password");
        }

        const hashedDbPassword = await getHash(user.password);
        const hashedInputPassword = await getHash(password);

        if (hashedDbPassword === hashedInputPassword) {
            return {
                success: true,
                user: _sanitizeUser(user)
            };
        } else {
            throw new Error("Invalid email or password");
        }
    } catch (err) {
        console.error("Login Error:", err.message);

        const publicMessage = (err.message.includes("Invalid") || err.message.includes("Login")) 
            ? err.message 
            : "System Error: Service unavailable";
            
        throw new Error(publicMessage);
    }
}

export async function registerUser(userData) {
    try {
        await simulateLatency();

        let existingUsers = {};
        try {
            existingUsers = await _getUsers();
        } catch (dbErr) {
            console.error("DB Error:", dbErr.message);
            throw new Error("Registration service is temporarily unavailable");
        }
        const errors = {};

        // VALIDATION ON THE "SERVER"
        const nameRegex = /^(?=.{2,30}$)\p{L}+(?:[\- ]\p{L}+)*$/u;
        if (!nameRegex.test(userData.firstName)) errors.firstName = "Invalid first name format";
        if (!nameRegex.test(userData.lastName)) errors.lastName = "Invalid last name format";

        const nicknameRegex = /^(?=.{2,30}$)\p{L}[\p{L}\d]*(?:[\-_ ][\p{L}\d]+)*$/u;
        if (userData.nickname && !nicknameRegex.test(userData.nickname)) {
            errors.nickname = "Nickname can only contain letters, numbers, spaces, _ and -";
        }

        const phoneRegex = /^(?:\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/
        if (!phoneRegex.test(userData.phone)) {
            errors.phone = "Invalid phone number";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.email = "Invalid email format";
        } else if (existingUsers.some(u => u.email === userData.email)) {
            errors.email = "This email is already registered";
        }

        if (Object.keys(errors).length > 0) {
            return {
                success: false,
                errors: errors,
                user: _sanitizeUser(userData)
            };
        }

        return {
            success: true,
            user: { ..._sanitizeUser(userData), id: Date.now() }
        };
    } catch (err) {
        console.error("Registration Error:", err.message);
        
        const publicMessage = err.message.includes("Registration") 
            ? err.message 
            : "System Error: Service unavailable";
            
        throw new Error(publicMessage);
    }
}

async function _getUsers() {
    const response = await fetch(_fakeDbPath);
    if (!response.ok) throw new Error("Could not fetch users");

    return await response.json();
}

function _sanitizeUser(user) {
    // Convert to Plain Object if it is a DB model
    const userData = user.toObject ? user.toObject() : user;

    // We remove all unnecessary things in one list
    const { password, salt, secretKey, ...publicData } = userData;
    return publicData;
}