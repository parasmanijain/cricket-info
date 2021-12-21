const mongoose = require('../database');

const countrySchema = new mongoose.Schema({
    name: { type: String, unique: true },
    cities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }]
});

const citySchema = new mongoose.Schema({
    name: { type: String, unique: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
    grounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ground' }]
});

const groundSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true }
});

module.exports = {
    Country: mongoose.model('Country', countrySchema),
    City: mongoose.model('City', citySchema),
    Ground: mongoose.model('Ground', groundSchema)
}