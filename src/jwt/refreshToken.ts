const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());

const users:any = []; // In-memory user store for demo purposes

// Secret keys for JWT tokens
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Refresh token store (in-memory for demo, should be persisted in a real app)
let refreshTokens:string[] = [];

// 1. Register User Endpoint (For Demo)
app.post('/register', (req:Request, res:Response) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    res.sendStatus(201);
});

// 2. Login User & Issue Access/Refresh Tokens
app.post('/login', (req:Request, res:Response) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.username);
    const refreshToken = jwt.sign({ username: user.username }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

    refreshTokens.push(refreshToken); // Store refresh token

    res.json({
        accessToken,
        refreshToken
    });
});

// 3. Protected Route (Require Access Token)
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: "Protected content" });
});

// 4. Refresh Token Endpoint
app.post('/auth/refresh', (req, res) => {
    const { token } = req.body;
    if (!token) return res.sendStatus(401);
    
    // Check if the refresh token is valid and stored
    if (!refreshTokens.includes(token)) return res.sendStatus(403);

    // Verify the refresh token
    jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        // Generate a new access token
        const newAccessToken = generateAccessToken(user.username);
        res.json({ accessToken: newAccessToken });
    });
});

// 5. Logout (Invalidate Refresh Token)
app.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => t !== token); // Remove refresh token
    res.sendStatus(204);
});

// Helper function to generate access token
function generateAccessToken(username) {
    return jwt.sign({ username }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

// Middleware to authenticate access token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Start the server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
