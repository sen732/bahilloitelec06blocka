const express = require('express');
const app = express();

// Correct API route
app.use('/api/posts', (req, res, next) => {
    const posts = [
        {
            id: "fsfsdfdsdf",
            title: "serverside title",
            content: "content serverside"
        },
        {
            id: "dsadadasadas",
            title: "serverside title2",
            content: "content serverside2"
        }
    ];

    res.json(posts);
});

module.exports = app;