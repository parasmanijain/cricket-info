const { Country } = require('../models/schemaModel');

const getCountryList =  (req, res) => {
    // get data from the view and add it to mongodb
    Country.find({}, null, { sort: { name: 1 } })
    .exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const getCountryCityList =  (req, res) => {
    // get data from the view and add it to mongodb
    Country.find({}, null, { sort: { name: 1 } })
    .populate({path: 'cities', options: { sort: { 'name': 1 } } })
    .exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const getCountryGroundList =  (req, res) => {
    // get data from the view and add it to mongodb
    Country.find({}, null, { sort: { name: 1 } })
    .populate({path: 'cities', options: { sort: { 'name': 1 } }, populate: [{ path: 'grounds', options: { sort: { 'name': 1 } } }] })
    .exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const addNewCountry = (req, res) => {
    // get data from the view and add it to mongodb
    var query = { 'name': req.body.name };
    const existing = req.body;
    Country.findOneAndUpdate(query, existing, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Country Succesfully added.');
    });
}

module.exports = {
    getCountryList,
    getCountryCityList,
    getCountryGroundList,
    addNewCountry
};