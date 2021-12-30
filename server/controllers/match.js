const { Match, Ground, Team } = require('../models/schemaModel');
const getMatchList = (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    // get data from the view and add it to mongodb
    Match.find({}, null, { sort: { start_date: 1 } })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
            path: 'ground',
            populate: [{ path: 'city', populate: [{ path: 'country' }] }]
        })
        .populate({
            path: 'match_innings',
            populate: {
                path: 'team',
                model: Team
            }
        })
        .populate({ 
            path: 'teams',
            populate: [{ path: 'team' }]
        })
        .populate('winner')
        .populate('loser')
        .exec(function (err, results) {
            if (err) return res.send(500, { error: err });
            Match.countDocuments({}).exec((count_error, count) => {
                if (err) {
                    return res.json(count_error);
                }
                return res.json({
                    total: count,
                    page: page,
                    pageSize: results.length,
                    matches: results
                });
            });
        });
};


const addNewMatch = async (req, res) => {
    try {
        const { start_date, end_date, ground, teams, winner, loser, draw, tie, wickets,
            innings, runs, margin, neutral, match_innings } = req.body;
        const count = await Match.countDocuments();
        // get data from the view and add it to mongodb
        let query = {
            'start_date': start_date, 'end_date': end_date, 'ground': ground, 'teams': teams,
            "match_innings": match_innings, "number": count + 1
        };
        if (neutral) {
            query = { ...query, ...{ 'neutral': neutral } };
        }
        if (draw) {
            query = { ...query, ...{ 'draw': draw } };
        } else if (tie) {
            query = { ...query, ...{ 'tie': tie } }
        } else {
            query = { ...query, ...{ 'winner': winner, 'loser': loser, 'margin': margin } };
            if (innings) {
                query = { ...query, ...{ 'innings': innings } };
            }
            if (runs) {
                query = { ...query, ...{ 'runs': runs } };
            }
            if (wickets) {
                query = { ...query, ...{ 'wickets': wickets } };
            }
        }
        const newMatch = await Match.create(query);
        if (!newMatch) throw err;
        let operations = {};
        const bulkGroundOps = [{
            updateOne: {
                filter: { _id: newMatch.ground },
                update: { "$push": { "matches": newMatch._id } },
                upsert: true,
                useFindAndModify: false
            }
        }];
        const groundOperation = await Ground.bulkWrite(bulkGroundOps)
            .then(bulkWriteOpResult => console.log('Ground BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Ground BULK update error:'));
        let bulkTeamOps, updateBlock;
        if (draw | tie) {
            if (draw) {
                updateBlock = {
                    "draws": {
                        "$concatArrays": [
                            '$draws',
                            [
                                newMatch._id
                            ],
                        ],
                    }
                };
            } else {
                updateBlock = {
                    "ties": {
                        "$concatArrays": [
                            '$ties',
                            [
                                newMatch._id
                            ],
                        ],
                    }
                };
            }
            bulkTeamOps = newMatch.teams.map(doc => ({
                updateOne: {
                    filter: { _id: doc.team },
                    update: [
                        {
                            "$set": {
                                ...updateBlock,
                                "highest": {
                                    "$max": [
                                        "$highest", ...((
                                            newMatch.match_innings
                                                .filter(el => el.team.equals(doc.team)))
                                            .map(e => e.runs))
                                    ]
                                },
                                "lowest": {
                                    "$min": ["$lowest", ...((newMatch.match_innings
                                        .filter(el => el.team.equals(doc.team) && (el.wickets === 10 || el.allout || el.declared)))
                                        .map(e => e.runs))]
                                }
                            }
                        }
                    ],
                    upsert: true,
                    useFindAndModify: false
                }
            }));
        } else {
            const bulkWinnerOps = [
                {
                    updateOne: {
                        filter: { _id: newMatch.winner },
                        update: [
                            {
                                "$set": {
                                    "wins": {
                                        "$concatArrays": [
                                            '$wins',
                                            [
                                                newMatch._id
                                            ],
                                        ],
                                    },
                                    "highest": {
                                        "$max": ["$highest", ...((
                                            newMatch.match_innings
                                                .filter(el => el.team.equals(newMatch.winner)))
                                            .map(e => e.runs))]
                                    },
                                    "lowest": {
                                        "$min": ["$lowest", ...((
                                            newMatch.match_innings
                                                .filter(el => el.team.equals(newMatch.winner) && (el.allout || el.declared)))
                                            .map(e => e.runs))]
                                    }
                                }
                            }
                        ],
                        upsert: true,
                        useFindAndModify: false
                    }
                }];
            const bulkLoserOps = [{
                updateOne: {
                    filter: { _id: newMatch.loser },
                    update: [
                        {
                            "$set": {
                                "losses": {
                                    "$concatArrays": [
                                        '$losses',
                                        [
                                            newMatch._id
                                        ],
                                    ],
                                },
                                "highest": {
                                    "$max": ["$highest", ...((
                                        newMatch.match_innings
                                            .filter(el => el.team.equals(newMatch.loser)))
                                        .map(e => e.runs))]
                                },
                                "lowest": {
                                    "$min": ["$lowest", ...((
                                        newMatch.match_innings
                                            .filter(el => el.team.equals(newMatch.loser) && (el.wickets === 10 || el.allout || el.declared)))
                                        .map(e => e.runs))]
                                }
                            }
                        }
                    ],
                    upsert: true,
                    useFindAndModify: false
                }
            }]
            bulkTeamOps = [...bulkWinnerOps, ...bulkLoserOps];
        }
        const teamOperation = await Team.bulkWrite(bulkTeamOps)
            .then(bulkWriteOpResult => console.log('Team BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Team BULK update error:'));
        return res.status(200).json({ "message": 'Records updated succesfully' });
    } catch (err) {
        return res.status(400).json(err);
    }
};

// Match.syncIndexes(function (err, res) {
//     if (err) {
//         console.log("Error", err);
//         return err;
//     }
//     console.log("Succes:", res);
//     return res;
// });

module.exports = {
    getMatchList,
    addNewMatch,
};
