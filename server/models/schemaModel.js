const mongoose = require('../database');



const countrySchema = new mongoose.Schema({
    name: { type: String, unique: true },
});



module.exports = {
    Country : mongoose.model('Country', countrySchema)
}