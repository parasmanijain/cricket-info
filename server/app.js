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
const player_controller = require('./controllers/player');

app.get('/countries', country_controller.getCountryList);
app.get('/countryGrounds', country_controller.getCountryGroundList);
app.get('/countryCities', country_controller.getCountryCityList);
app.get('/countryGroundsCount', country_controller.getCountryGroundCount);
app.post('/country', country_controller.addNewCountry);

app.get('/cities', city_controller.getCityList);
app.post('/city', city_controller.addNewCity);

app.get('/grounds', ground_controller.getGroundList);
app.post('/ground', ground_controller.addNewGround);

app.get('/teams', team_controller.getTeamList);
app.get('/teamStatistics', team_controller.getTeamStatistics);
app.post('/team', team_controller.addNewTeam);

app.get('/matches', match_controller.getMatchList);
app.post('/match', match_controller.addNewMatch);

app.post('/player', player_controller.addNewPlayer);

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