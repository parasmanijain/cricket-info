const { Player, Team } = require('../models/schemaModel');

const addNewPlayer = async (req, res) => {
    try {
        const { name, team } = req.body;
        const query = {
            name,
            team,
            matches: [],
            batting: {
                innings: 0,
                runs_scored: 0,
                highest_score: 0,
                fifties: 0,
                hundreds: 0,
                double_hundreds: 0
            },
            bowling: {
                innings: 0,
                wickets_taken: 0,
                runs_conceded: 0,
                best_figures: 0,
                four_wickets_inning: 0,
                five_wickets_inning: 0,
                ten_wickets_match: 0
            }
        }
        const newPlayer = await Player.create(query);
        if(newPlayer) {
            const bulkTeamOps = newPlayer.team.map(doc => ({
                updateOne: {
                    filter: { _id: doc },
                    update: { "$push": { "players": newPlayer._id } },
                    upsert: true,
                    useFindAndModify: false
                }
            }));
            let operation = await Team.bulkWrite(bulkTeamOps)
                .then(bulkWriteOpResult => console.log('Team BULK update OK:', bulkWriteOpResult))
                .catch(console.error.bind(console, 'Team BULK update error:'))
            return res.status(200).json({ "message": "Record updated successfully" });
        }
        return res.status(200).json(newPlayer);
    } catch (err) {
        return res.status(400).json(err);
    }
};

module.exports = {
    addNewPlayer
};