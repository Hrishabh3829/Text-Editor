const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use('/editor', express.static(path.join(__dirname, 'client')));

const db = mysql.createConnection({
    host: 'mysql-387af68e-brainwave-database.h.aivencloud.com',
    user: 'avnadmin',
    password: process.env.DB_PASSWORD,
    database: 'chatDB',
    port: 21277,
    ssl: { rejectUnauthorized: false }
});


db.connect(err => {
    if (err) {
        console.error('MySQL Connection Error:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});


io.on('connection', (socket) => {
    console.log("Connected to socket");

    db.query('SELECT * FROM messages ORDER BY timestamp ASC', (err, results) => {
        if (!err) {
            socket.emit('loadMessages', results);
        }
    });

    socket.on('textUpdate', (text) => {
        console.log("Text update received: " + text);

        db.query('INSERT INTO messages (text) VALUES (?)', [text], (err, result) => {
            if (err) {
                console.error('Error saving message:', err);
                return;
            }
            console.log('Message saved to DB:', result.insertId);
        });

        
        socket.broadcast.emit('updatedText', text);
    });
});

server.listen(3000, () => {
    console.log("Running on port 3000 /editor");
});
