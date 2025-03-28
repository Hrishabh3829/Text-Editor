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
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

db.connect(err => {
    if (err) {
        console.error('MySQL Connection Error:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

let currentText = "";  

io.on('connection', (socket) => {
    console.log("New client connected");

   
    socket.emit('startingCoEditor', currentText);

    
    socket.on('textUpdate', (text) => {
        currentText = text;  
        socket.broadcast.emit('updatedText', text);
    });

    
    socket.on('saveText', (text) => {
        db.query('INSERT INTO messages (text, timestamp) VALUES (?, NOW())', [text], (err, result) => {
            if (err) {
                console.error('Error saving message:', err);
                return;
            }
            console.log(`Message saved to DB: ID ${result.insertId}, Text: "${text}"`);
            socket.emit('saveSuccess');  
        });
    });

    socket.on('disconnect', () => {
        console.log("Client disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000 at /editor");
});
