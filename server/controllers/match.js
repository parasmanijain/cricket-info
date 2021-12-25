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
        .populate('teams')
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
        match_innings.map(ele => {
            Inning
        });
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
        const groundOperation = Ground.bulkWrite(bulkGroundOps)
            .then(bulkWriteOpResult => console.log('Ground BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Ground BULK update error:'));
        operations = { ...operations, groundOperation };
        let bulkTeamOps;
        if (draw | tie) {
            bulkTeamOps = newMatch.teams.map(doc => ({
                updateOne: {
                    filter: { _id: doc },
                    update: [
                        {
                            "$push": draw ? { "draws": newMatch._id } : { "ties": newMatch._id }
                        },
                        {
                            "$set": {
                                "highest": {
                                    "$max": [
                                        "$highest", ...((
                                        newMatch.match_innings
                                        .filter(el => el.team === doc))
                                        .map(e => e.runs))
                                    ]
                                },
                                "lowest": {
                                    "$min": ["$lowest", ...((newMatch.match_innings
                                        .filter(el => el.team === doc && (el.allout || el.declared)))
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
                                "$push": { "wins": newMatch._id }
                            },
                            {
                                "$set": {
                                    "highest": {
                                        "$max": ["$highest", ...((
                                            newMatch.match_innings
                                            .filter(el => el.team === newMatch.winner))
                                            .map(e => e.runs))]
                                    },
                                    "lowest": {
                                        "$min": ["$lowest", ...((
                                            newMatch.match_innings
                                            .filter(el => el.team === newMatch.winner && (el.allout || el.declared)))
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
                            "$push": { "losses": newMatch._id }
                        },
                        {
                            "$set": {
                                "highest": {
                                    "$max": ["$highest", ...((
                                        newMatch.match_innings
                                        .filter(el => el.team === newMatch.loser))
                                        .map(e => e.runs))]
                                },
                                "lowest": {
                                    "$min": ["$lowest", ...((
                                        newMatch.match_innings
                                        .filter(el => el.team === newMatch.loser && (el.allout || el.declared)))
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
        const teamOperation = Team.bulkWrite(bulkTeamOps)
            .then(bulkWriteOpResult => console.log('Team BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Team BULK update error:'));
        operations = { ...operations, teamOperation };
        let [someResult, anotherResult] = await Promise.all(operations
        )
        return res.status(200).json({ someResult, anotherResult });
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

// Match.find({}).exec(function(err,results) {
//     results.forEach(function(x, index) {
//         Match.updateOne({"_id": x._id}, {"$set": {"number": index+1 }}).exec(function (err, res) {
//             if (err) {
//                 console.log(err);
//                 return err;
//             }
//             console.log(res);
//             return res;
//         });
//      });
// });


module.exports = {
    getMatchList,
    addNewMatch,
};