const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Ensure required environment variables are present
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required in environment variables');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
const users = new Map();
const verificationCodes = new Map();
const cards = new Map();
const transactions = new Map();
const subscriptions = new Map();

// Constants
const VERIFICATION_EXPIRY = 300000; // 5 minutes in milliseconds
const RETRY_DELAY = 60000; // 1 minute in milliseconds

// Initialize some sample data
cards.set(1, {
  id: 1,
  last4: '4242',
  brand: 'Visa',
  expMonth: 12,
  expYear: 2024,
  isDefault: true,
  stripePaymentMethodId: 'pm_test_sample'
});

// Initialize test users with different subscription states
users.set('+11234567890', {
  email: 'active@example.com',
  phoneNumber: '+11234567890',
  verified: true
});

users.set('+10987654321', {
  email: 'inactive@example.com',
  phoneNumber: '+10987654321',
  verified: true
});

// Set up subscriptions for test users
subscriptions.set('+11234567890', {
  is_active: true,
  category: 'Premium',
  variation: 'month',
  next_renewal: {
    unixtime: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
  },
  userFeatures: {
    unmasking: true,
    blacklist: true,
    missed_call_alerts: true,
    cnam: true,
    transcriptions: true,
    recording: true
  },
  price: '9.99'
});

subscriptions.set('+10987654321', {
  is_active: false,
  category: 'Basic',
  variation: 'month',
  next_renewal: {
    unixtime: Math.floor(Date.now() / 1000) - (24 * 60 * 60) // Expired yesterday
  },
  userFeatures: {
    unmasking: false,
    blacklist: false,
    missed_call_alerts: false,
    cnam: false,
    transcriptions: false,
    recording: false
  },
  price: '4.95'
});

const planFeatures = {
  basic: [
    { title: 'Unmask blocked calls', included: true },
    { title: 'Block harassing callers', included: true },
    { title: 'Spam protection', included: true },
    { title: '10 reverse number lookups', included: true },
  ],
  premium: [
    { title: 'Unmask blocked calls', included: true },
    { title: 'Block harassing callers', included: true },
    { title: 'Spam protection', included: true },
    { title: 'Privacy Lock', included: true },
    { title: 'Missed call alerts', included: true },
    { title: 'Name & Address Caller ID', included: true },
    { title: '50 reverse number lookups', included: true },
    { title: '10 call recordings', included: true },
    { title: '10 voicemail transcriptions', included: true },
    { title: 'Unlimited reverse number lookups', included: false },
    { title: 'Unlimited transcriptions', included: false },
    { title: 'Unlimited Call recording', included: false }
  ],
  ultimate: [
    { title: 'Unmask blocked calls', included: true },
    { title: 'Block harassing callers', included: true },
    { title: 'Spam protection', included: true },
    { title: 'Privacy Lock', included: true },
    { title: 'Missed call alerts', included: true },
    { title: 'Name & Address Caller ID', included: true },
    { title: 'Unlimited reverse number lookups', included: true },
    { title: 'Unlimited transcriptions', included: true },
    { title: 'Unlimited Call recording', included: true }
  ]
};

const planPricing = {
  basic: {
    month: 5.99,
    year: 59.99,
    two_years: 99.99
  },
  premium: {
    month: 9.99,
    year: 99.99,
    two_years: 179.99
  },
  ultimate: {
    month: 13.49,
    year: 134.99,
    two_years: 239.99
  }
};

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    color: 'blue',
    features: planFeatures.basic.filter(f => f.included).map(f => ({
      title: f.title,
      description: f.title
    }))
  },
  {
    id: 'premium',
    name: 'Premium',
    color: 'green',
    features: planFeatures.premium.filter(f => f.included).map(f => ({
      title: f.title,
      description: f.title
    }))
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    color: 'purple',
    features: planFeatures.ultimate.filter(f => f.included).map(f => ({
      title: f.title,
      description: f.title
    }))
  }
];

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

// Get subscription endpoint
app.get('/api/subscription', authenticateToken, (req, res) => {
    try {
        const { phoneNumber } = req.user;
        const subscription = subscriptions.get(phoneNumber);
        
        if (!subscription) {
            return res.json({
                is_active: false,
                category: 'Basic',
                variation: 'month',
                next_renewal: {
                    unixtime: Math.floor(Date.now() / 1000)
                },
                userFeatures: {
                    unmasking: false,
                    blacklist: false,
                    missed_call_alerts: false,
                    cnam: false,
                    transcriptions: false,
                    recording: false
                },
                price: '4.95'
            });
        }

        res.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ message: 'Error fetching subscription' });
    }
});

// Create Setup Intent endpoint
app.post('/api/setup-intent', authenticateToken, async (req, res) => {
    try {
        const setupIntent = await stripe.setupIntents.create({
            payment_method_types: ['card'],
            usage: 'off_session',
        });

        res.json({
            clientSecret: setupIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating setup intent:', error);
        res.status(500).json({ 
            message: 'Error creating setup intent',
            error: error.message 
        });
    }
});

// Confirm Setup Intent endpoint
app.post('/api/confirm-setup-intent', authenticateToken, async (req, res) => {
    try {
        const { clientSecret, paymentMethod } = req.body;

        if (!clientSecret || !paymentMethod) {
            return res.status(400).json({ message: 'Client secret and payment method are required' });
        }

        // Retrieve the setup intent from Stripe
        const setupIntentId = clientSecret.split('_secret_')[0];
        const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

        if (setupIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Setup intent not succeeded' });
        }

        // Create a new card
        const cardId = Math.max(...Array.from(cards.keys()), 0) + 1;
        const newCard = {
            id: cardId,
            last4: paymentMethod.last4,
            brand: paymentMethod.brand,
            expMonth: paymentMethod.exp_month,
            expYear: paymentMethod.exp_year,
            isDefault: cards.size === 0, // Make default if it's the first card
            stripePaymentMethodId: paymentMethod.id
        };

        cards.set(cardId, newCard);

        res.json({
            setupIntent: {
                id: setupIntent.id,
                status: setupIntent.status
            },
            card: newCard
        });
    } catch (error) {
        console.error('Error confirming setup intent:', error);
        res.status(500).json({ 
            message: 'Error confirming setup intent',
            error: error.message 
        });
    }
});

// Set default payment method endpoint
app.post('/api/payment-methods/:id/default', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const cardId = parseInt(id);
        const card = cards.get(cardId);

        if (!card) {
            return res.status(404).json({ message: 'Payment method not found' });
        }

        // Update all cards to non-default
        for (const [key, existingCard] of cards.entries()) {
            cards.set(key, { ...existingCard, isDefault: false });
        }

        // Set the selected card as default
        cards.set(cardId, { ...card, isDefault: true });

        res.json({ message: 'Default payment method updated' });
    } catch (error) {
        console.error('Error updating default payment method:', error);
        res.status(500).json({ 
            message: 'Error updating default payment method',
            error: error.message 
        });
    }
});

// Delete payment method endpoint
app.delete('/api/payment-methods/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const cardId = parseInt(id);
        const card = cards.get(cardId);

        if (!card) {
            return res.status(404).json({ message: 'Payment method not found' });
        }

        if (card.isDefault) {
            return res.status(400).json({ message: 'Cannot delete default payment method' });
        }

        cards.delete(cardId);
        res.json({ message: 'Payment method deleted' });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        res.status(500).json({ 
            message: 'Error deleting payment method',
            error: error.message 
        });
    }
});

// Get plan features endpoint
app.get('/api/plans/:planId/features', authenticateToken, (req, res) => {
    try {
        const { planId } = req.params;
        const features = planFeatures[planId];
        
        if (!features) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        
        res.json(features);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plan features' });
    }
});

// Get plan pricing endpoint
app.get('/api/plans/:planId/pricing', authenticateToken, (req, res) => {
    try {
        const { planId } = req.params;
        const pricing = planPricing[planId];
        
        if (!pricing) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plan pricing' });
    }
});

// Change plan endpoint
app.post('/api/change-plan', authenticateToken, (req, res) => {
    try {
        const { planId, duration } = req.body;
        const { phoneNumber } = req.user;

        if (!planId || !duration) {
            return res.status(400).json({ message: 'Plan ID and duration are required' });
        }

        // Validate plan exists
        const plan = plans.find(p => p.id === planId);
        if (!plan) {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        // Validate duration
        const validDurations = ['month', 'year', 'two_years'];
        if (!validDurations.includes(duration)) {
            return res.status(400).json({ message: 'Invalid duration selected' });
        }

        // Calculate next billing date based on duration
        const durationInDays = {
            'month': 30,
            'year': 365,
            'two_years': 730
        };

        const nextBillingDate = new Date(Date.now() + durationInDays[duration] * 24 * 60 * 60 * 1000);

        // Update subscription
        const subscription = {
            planId,
            duration,
            startDate: new Date(),
            nextBillingDate
        };

        subscriptions.set(phoneNumber, subscription);

        res.json({ 
            message: 'Plan changed successfully',
            subscription
        });
    } catch (error) {
        res.status(500).json({ message: 'Error changing plan' });
    }
});

// Get plans endpoint
app.get('/api/plans', authenticateToken, (req, res) => {
    try {
        const { phoneNumber } = req.user;
        const subscription = subscriptions.get(phoneNumber);
        
        const plansWithCurrentFlag = plans.map(plan => ({
            ...plan,
            current: subscription ? plan.id === subscription.planId : plan.id === 'basic'
        }));
        
        res.json(plansWithCurrentFlag);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plans' });
    }
});

// Get payment methods endpoint
app.get('/api/payment-methods', authenticateToken, (req, res) => {
    try {
        const userCards = Array.from(cards.values());
        res.json(userCards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment methods' });
    }
});

// Get transactions endpoint
app.get('/api/transactions', authenticateToken, (req, res) => {
    try {
        const userTransactions = Array.from(transactions.values());
        res.json(userTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

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

        if (Date.now() - storedVerification.timestamp > VERIFICATION_EXPIRY) {
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
        const token = jwt.sign({ phoneNumber }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });

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

        if (Date.now() - storedVerification.timestamp > VERIFICATION_EXPIRY) {
            verificationCodes.delete(phoneNumber);
            return res.status(400).json({ message: 'Verification code expired' });
        }

        if (storedVerification.code !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        verificationCodes.delete(phoneNumber);

        // Generate JWT token
        const token = jwt.sign({ phoneNumber }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });

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

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const newPort = PORT + 1;
        console.log(`Port ${PORT} is busy, trying port ${newPort}`);
        app.listen(newPort, () => {
            console.log(`Server running on port ${newPort}`);
        });
    } else {
        console.error('Server error:', err);
    }
});
