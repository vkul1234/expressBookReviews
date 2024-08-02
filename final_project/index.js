const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Setup session management
app.use(session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true,
  
}));

// Authentication middleware for /customer/auth/*
app.use('/customer/auth/*', function auth(req, res, next) => {
    if (req.session.authorization && req.session.authorization.accessToken) {
        const token = req.session.authorization.accessToken;

        // Verify JWT token
        jwt.verify(token, 'access', (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }

            // Attach user info to the request object
            req.user = user;
            next();
        });
    } else {
        return res.sendStatus(403); // Forbidden
    }
});

// Use routes
app.use('/customer', customer_routes);
app.use('/', genl_routes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
