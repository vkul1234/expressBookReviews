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


const getBooksAsync = () => {
    return new Promise((resolve, reject) => {
        // Simulate async operation
        setTimeout(() => {
            resolve(books);
        }, 6000); // Simulate 1 second delay
    });
};

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    getBooksAsync()
    .then(books => {
        res.json(books);
    })
    .catch(error => {
        res.status(500).json({ error: 'Failed to retrieve books.' });
    });
});

const getBookByIsbnAsync = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject('Book not found.');
            }
        }, 3000); 
    });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    getBookByIsbnAsync(isbn)
        .then(book => {
            res.json(book);
        })
        .catch(error => {
            res.status(404).json({ error });
        });
 });
 const getBooksByAuthorAsync = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const keys = Object.keys(books);
            const booksByAuthor = keys.reduce((acc, key) => {
                if (books[key].author === author) {
                    acc.push(books[key]);
                }
                return acc;
            }, []);
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject('No books found for this author.');
            }
        }, 3000); 
    });
};
 
 
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooksByAuthorAsync(author)
        .then(booksByAuthor => {
            res.json(booksByAuthor);
        })
        .catch(error => {
            res.status(404).json({ error });
        });
});
const getBooksByTitleAsync = async (title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const keys = Object.keys(books);
            const booksByTitle = keys.reduce((acc, key) => {
                if (books[key].title === title) {
                    acc.push(books[key]);
                }
                return acc;
            }, []);
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject('No books found with this title.');
            }
        }, 1000);
    });
};
// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const booksByTitle = await getBooksByTitleAsync(title);
        res.json(booksByTitle);
    } catch (error) {
        res.status(404).json({ error });
    }
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
