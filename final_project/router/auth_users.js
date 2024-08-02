const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if a username is valid
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to authenticate a user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, 'access', (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// Login route
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: '1h' });
    req.session.authorization = {
        data: username,
        accessToken,
    };
    res.json({ message: 'Login successful', token: accessToken });
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.data; // Adjusted to match how data is stored in JWT

    if (!review) {
        return res.status(400).json({ error: 'Review content is required.' });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    // Add or update the review
    book.reviews[username] = review;

    res.json({ message: 'Review posted successfully.', reviews: book.reviews });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const username = req.user.data; // Adjusted to match how data is stored in JWT

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    // Check if the review exists and remove it
    if (book.reviews[username]) {
        delete book.reviews[username];
        res.json({ message: 'Review deleted successfully.', reviews: book.reviews });
    } else {
        res.status(404).json({ error: 'Review not found for this user.' });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
