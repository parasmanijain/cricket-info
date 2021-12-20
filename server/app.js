require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

function setupCORS(req, res, next) {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-type,Accept,X-Access-Token,X-Key');
    res.header('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
}

app.all('/*', setupCORS);
app.listen(process.env.API_PORT, () => {
    console.log(`Server has started at ${process.env.API_PORT}`)
});