const { City, Country } = require('../models/schemaModel');

const getCityList = (req, res) => {
    // get data from the view and add it to mongodb
    City.find({}, null, { sort: { name: 1 } }).populate('country').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const addNewCity = async (req, res) => {
    try {
        const { name, grounds, country } = req.body;
        // get data from the view and add it to mongodb
        var query = { 'name': name, 'grounds': grounds, 'country': country };
        let doc = await City.findOneAndUpdate(query, { "$set": { "name": name } }, {
            new: true,
            upsert: true,
            useFindAndModify: false
        });
        if (!doc) {
            return res.send(500, { error: err });
        }
        const bulkCountryOps = [{
            updateOne: {
                filter: { _id: country },
                update: { "$push": { "cities": doc._id } },
                upsert: true,
                useFindAndModify: false
            }
        }];
        let [someResult, anotherResult] = await Promise.all(Country.bulkWrite(bulkCountryOps)
            .then(bulkWriteOpResult => console.log('Country BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'Country BULK update error:'))
        )
        return res.status(200).json({ someResult, anotherResult });
    }

    catch (err) {
        return res.status(400).json(err);
    }
};

City.syncIndexes(function (err, res) {
    if (err) {
        console.log("Error", err);
        return err;
    }
    console.log("Succes:", res);
    return res;
});

module.exports = {
    getCityList,
    addNewCity
};