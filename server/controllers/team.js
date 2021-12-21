const { Team } = require('../models/schemaModel');

const getTeamList =  (req, res) => {
    // get data from the view and add it to mongodb
    Team.find({}, null, { sort: { name: 1 } })
    .populate('wins')
    .populate('losses')
    .populate('draws')
    .populate('ties')
    .exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const addNewTeam = (req, res) => {
    // get data from the view and add it to mongodb
    var query = { 'name': req.body.name,  };
    const existing = req.body;
    Team.findOneAndUpdate(query, existing, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Team Succesfully added.');
    });
}

module.exports = {
    getTeamList,
    addNewTeam
};