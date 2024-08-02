const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    if (isValid(username)) {
        return res.status(409).json({ error: 'Username already exists.' });
    }

    users.push({ username, password });
    res.status(201).json({ message: 'User registered successfully.' });
});



// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn=req.params.isbn;
  let filtered=books[isbn];
  res.send(filtered);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
   const author = req.params.author;
    const keys = Object.keys(books);
    const booksByAuthor = keys.reduce((acc, key) => {
        if (books[key].author === author) {
            acc.push(books[key]);
        }
        return acc;
    }, []);
    res.send(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
    const keys = Object.keys(books);
    const booksByTitle = keys.reduce((acc, key) => {
        if (books[key].title === title) {
            acc.push(books[key]);
        }
        return acc;
    }, []);
    res.send(booksByTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        res.send(book.reviews);
    } else {
        res.status(404).json({ error: 'Book not found.' });
    }
});

module.exports.general = public_users;
