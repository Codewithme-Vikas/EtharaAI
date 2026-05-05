const jwt = require("jsonwebtoken")
require("dotenv").config()

const User = require("../models/User");

// Signup route handler
exports.signup = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please provide name, email, and password!" })
        }

        // Check whether user already exists
        const isUserExists = await User.findOne({ $or: [{ email }, { name }] });

        if (isUserExists) {
            return res.status(400).json({ success: false, message: "User with this email or name already exists!" });
        }

        // Create user - password hashing handled by pre-save hook
        const userDoc = await User.create({
            name,
            email,
            password
        });

        // Generate JWT token
        const token = jwt.sign(
            { email: userDoc.email, id: userDoc._id },
            process.env.JWT_SECRECT_KEY,
            { expiresIn: '24h' }
        );

        // Exclude password from response
        const userResponse = userDoc.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: { user: userResponse, token }
        });

    } catch (error) {
        console.log(error, 'signup endpoint')
        res.status(500).json({ success: false, message: "Error registering user. Please try later!" })
    }
};

// Login route handler
exports.login = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password!" })
        }

        // Find user by email
        const userDoc = await User.findOne({ email });

        if (!userDoc) {
            return res.status(401).json({ success: false, message: "Invalid credentials!" })
        }

        // Compare password using model method
        const isPasswordValid = await userDoc.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials!" })
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: userDoc.email, id: userDoc._id },
            process.env.JWT_SECRECT_KEY,
            { expiresIn: '24h' }
        );

        // Exclude password from response
        const userResponse = userDoc.toObject();
        delete userResponse.password;

        return res.status(200)
            .cookie('token', token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000) })
            .json({
                success: true,
                message: "Login successful!",
                data: { user: userResponse, token }
            })

    } catch (error) {
        console.log(error, 'login endpoint')
        return res.status(500).json({ success: false, message: "Error during login. Please try later!" })
    }
}
