const { Team } = require('../models/schemaModel');

const getTeamList = (req, res) => {
    // get data from the view and add it to mongodb
    Team.find({}, null, { sort: { name: 1 } })
        .exec(function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        });
};

const getTeamStatistics = (req, res) => {
    // get data from the view and add it to mongodb
    Team.aggregate(
        [

            {
                "$project":
                {
                    name: 1,
                    wins: { $size: "$wins" },
                    losses: { $size: "$losses" },
                    draws: { $size: "$draws" },
                    ties: { $size: "$ties" },
                    matches: { $concatArrays: ["$wins", "$losses", "$draws", "$ties"] },

                }
            },
            {
                "$lookup": {
                    from: 'matches',
                    localField: 'matches',
                    foreignField: '_id',
                    as: 'matches'
                }
            },
            {
                "$project": {
                    name: 1,
                    wins: 1,
                    losses: 1,
                    draws: 1,
                    ties: 1,
                    start_date: {
                        "$year": {
                            "$min": {
                                "$map": {
                                    input: "$matches",
                                    as: "m",
                                    in: {
                                        "$min": "$$m.start_date"
                                    }

                                }
                            }
                        }
                    },
                    end_date: {
                        "$year": {
                            "$max": {
                                "$map": {
                                    input: "$matches",
                                    as: "m",
                                    in: {
                                        "$min": "$$m.end_date"
                                    }

                                }
                            }
                        }
                    }
                }
            }

        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
};

const addNewTeam = (req, res) => {
    // get data from the view and add it to mongodb
    var query = { 'name': req.body.name, };
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
    getTeamStatistics,
    addNewTeam
};