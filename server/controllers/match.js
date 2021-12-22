const { Match, Ground, Team } = require('../models/schemaModel');

const getMatchList = (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 36;
    // get data from the view and add it to mongodb
    Match.find({}, null, { sort: { name: 1 } })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('ground')
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
            innings, runs, margin } = req.body;
        // get data from the view and add it to mongodb
        let query = {
            'start_date': start_date, 'end_date': end_date, 'ground': ground, 'teams': teams
        };
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
                    update: { "$push": draw ? { "draws": newMatch._id } : { "ties": newMatch._id } },
                    upsert: true,
                    useFindAndModify: false
                }
            }));
        } else {
             bulkTeamOps = [{
                updateOne: {
                    filter: { _id: newMatch.winner },
                    update: { "$push": { "wins": newMatch._id } },
                    upsert: true,
                    useFindAndModify: false
                },
                updateOne: {
                    filter: { _id: newMatch.loser },
                    update: { "$push": { "losses": newMatch._id } },
                    upsert: true,
                    useFindAndModify: false
                }
            }];
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

module.exports = {
    getMatchList,
    addNewMatch,
};