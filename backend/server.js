const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
const users = new Map();
const verificationCodes = new Map();

// JWT secret key
const JWT_SECRET = 'your-secret-key'; // In production, use environment variables

// Constants
const VERIFICATION_EXPIRY = 300000; // 5 minutes in milliseconds
const RETRY_DELAY = 60000; // 1 minute in milliseconds

// Generate a random 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simulate sending SMS (in production, use a real SMS service like Twilio)
function simulateSendSMS(phoneNumber, code) {
    console.log(`Sending SMS to ${phoneNumber} with code: ${code}`);
    // In production, implement real SMS sending here
}

// Validate phone number format (basic validation)
function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to send verification code
function sendVerificationCode(phoneNumber, type) {
    const verificationCode = generateVerificationCode();
    verificationCodes.set(phoneNumber, {
        code: verificationCode,
        timestamp: Date.now(),
        type,
        lastRetry: Date.now()
    });
    simulateSendSMS(phoneNumber, verificationCode);
    return verificationCode;
}

// Resend code endpoint
app.post('/api/resend-code', async (req, res) => {
    try {
        const { phoneNumber, type } = req.body;

        if (!phoneNumber || !type) {
            return res.status(400).json({ message: 'Phone number and type are required' });
        }

        const storedVerification = verificationCodes.get(phoneNumber);
        
        // Check if there's an existing verification attempt
        if (!storedVerification) {
            return res.status(400).json({ message: 'No verification in progress' });
        }

        // Check if enough time has passed since last retry
        const timeSinceLastRetry = Date.now() - storedVerification.lastRetry;
        if (timeSinceLastRetry < RETRY_DELAY) {
            const remainingTime = Math.ceil((RETRY_DELAY - timeSinceLastRetry) / 1000);
            return res.status(429).json({ 
                message: `Please wait ${remainingTime} seconds before requesting a new code`,
                remainingTime
            });
        }

        // Send new verification code
        sendVerificationCode(phoneNumber, type);

        res.json({ 
            message: 'New verification code sent',
            phoneNumber
        });
    } catch (error) {
        res.status(500).json({ message: 'Error resending verification code' });
    }
});

// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;

        if (!email || !phoneNumber) {
            return res.status(400).json({ message: 'Email and phone number are required' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number format. Use international format (e.g., +1234567890)' });
        }

        if (Array.from(users.values()).some(user => user.phoneNumber === phoneNumber)) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        if (Array.from(users.values()).some(user => user.email === email)) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Store user data temporarily
        const tempUserData = {
            email,
            phoneNumber,
            verified: false
        };
        users.set(phoneNumber, tempUserData);

        // Send verification code
        sendVerificationCode(phoneNumber, 'signup');

        res.status(201).json({ 
            message: 'Verification code sent to your phone number',
            phoneNumber
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during signup' });
    }
});

// Verify signup code endpoint
app.post('/api/verify-signup', async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;

        const storedVerification = verificationCodes.get(phoneNumber);
        const user = users.get(phoneNumber);

        if (!storedVerification || !user) {
            return res.status(400).json({ message: 'Invalid verification attempt' });
        }

        if (storedVerification.type !== 'signup') {
            return res.status(400).json({ message: 'Invalid verification type' });
        }

        if (Date.now() - storedVerification.timestamp > 300000) { // 5 minutes expiry
            verificationCodes.delete(phoneNumber);
            return res.status(400).json({ message: 'Verification code expired' });
        }

        if (storedVerification.code !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Update user as verified
        user.verified = true;
        users.set(phoneNumber, user);
        verificationCodes.delete(phoneNumber);

        // Generate JWT token
        const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Signup successful',
            token,
            user: {
                phoneNumber: user.phoneNumber,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during verification' });
    }
});

// Login endpoint (initiates 2FA)
app.post('/api/login', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const user = users.get(phoneNumber);
        if (!user || !user.verified) {
            return res.status(401).json({ message: 'Invalid phone number or user not verified' });
        }

        // Send verification code
        sendVerificationCode(phoneNumber, 'login');

        res.json({
            message: 'Verification code sent to your phone number',
            phoneNumber
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
});

// Verify login code endpoint (complete 2FA)
app.post('/api/verify-login', async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;

        const storedVerification = verificationCodes.get(phoneNumber);
        const user = users.get(phoneNumber);

        if (!storedVerification || !user) {
            return res.status(400).json({ message: 'Invalid verification attempt' });
        }

        if (storedVerification.type !== 'login') {
            return res.status(400).json({ message: 'Invalid verification type' });
        }

        if (Date.now() - storedVerification.timestamp > 300000) { // 5 minutes expiry
            verificationCodes.delete(phoneNumber);
            return res.status(400).json({ message: 'Verification code expired' });
        }

        if (storedVerification.code !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        verificationCodes.delete(phoneNumber);

        // Generate JWT token
        const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                phoneNumber: user.phoneNumber,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during verification' });
    }
});

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
    const user = users.get(req.user.phoneNumber);
    res.json({ 
        message: 'You have access to this protected route',
        user: {
            phoneNumber: user.phoneNumber,
            email: user.email
        }
    });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        // Try the next port
        const newPort = PORT + 1;
        console.log(`Port ${PORT} is busy, trying port ${newPort}`);
        app.listen(newPort, () => {
            console.log(`Server running on port ${newPort}`);
        });
    } else {
        console.error('Server error:', err);
    }
}); 
