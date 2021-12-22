require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const country_controller = require('./controllers/country');
const city_controller = require('./controllers/city');
const ground_controller = require('./controllers/ground');
const team_controller = require('./controllers/team');
const match_controller = require('./controllers/match');

app.get('/countries', country_controller.getCountryList);
app.get('/cities', city_controller.getCityList);
app.get('/grounds', ground_controller.getGroundList);
app.get('/teams', team_controller.getTeamList);
app.get('/matches', match_controller.getMatchList);

app.post('/country', country_controller.addNewCountry);
app.post('/city', city_controller.addNewCity);
app.post('/ground', ground_controller.addNewGround);
app.post('/team', team_controller.addNewTeam);
app.post('/match', match_controller.addNewMatch);

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