const mongoose = require('../database');

const countrySchema = new mongoose.Schema({
    name: { type: String, unique: true },
    cities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }]
});

const citySchema = new mongoose.Schema({
    name: { type: String },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    grounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ground' }]
});

const groundSchema = new mongoose.Schema({
    name: { type: String },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }]
});

const teamSchema = new mongoose.Schema({
    name: { type: String },
    wins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
    losses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
    draws: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
    ties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
    highest: { type: Number },
    lowest: { type: Number }
});

const matchSchema = new mongoose.Schema({
    number: { type: Number },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    ground: { type: mongoose.Schema.Types.ObjectId, ref: 'Ground', required: true },
    teams: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }], validate: [(val) => val.length === 2, 'Must have two teams'] },
    neutral: { type: Boolean },
    match_innings: [{
        number: { type: Number },
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        runs: { type: Number },
        wickets: { type: Number },
        declared: { type: Boolean },
        allout: { type: Boolean },
        follow_on: { type: Boolean }
    }],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    loser: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    draw: { type: Boolean },
    tie: { type: Boolean },
    wickets: { type: Boolean },
    innings: { type: Boolean },
    runs: { type: Boolean },
    margin: { type: Number }
});

citySchema.index({ name: 1, country: 1 }, { unique: true });
groundSchema.index({ name: 1, city: 1 }, { unique: true });

module.exports = {
    Country: mongoose.model('Country', countrySchema),
    City: mongoose.model('City', citySchema),
    Ground: mongoose.model('Ground', groundSchema),
    Team: mongoose.model('Team', teamSchema),
    Match: mongoose.model('Match', matchSchema)
}