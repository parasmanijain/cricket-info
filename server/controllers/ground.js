const { Ground, City } = require('../models/schemaModel');

const getGroundList = (req, res) => {
    // get data from the view and add it to mongodb
    Ground.find({}, null, { sort: { name: 1 } }).populate('city').exec(function (err, results) {
        if (err) return res.send(500, { error: err });
        return res.send(results);
    });
};

const addNewGround = async (req, res) => {
    try {
        const { name, city, matches } = req.body;
        // get data from the view and add it to mongodb
        var query = { 'name': name, 'city': city, 'matches': matches };
        let doc = await Ground.findOneAndUpdate(query, { "$set": { "name": name } }, {
            new: true,
            upsert: true,
            useFindAndModify: false
        });
        if (!doc) {
            return res.send(500, { error: err });
        }
        const bulkCityOps = [{
            updateOne: {
                filter: { _id: city },
                update: { "$push": { "grounds": doc._id } },
                upsert: true,
                useFindAndModify: false
            }
        }];
        let [someResult, anotherResult] = await Promise.all(City.bulkWrite(bulkCityOps)
            .then(bulkWriteOpResult => console.log('City BULK update OK:', bulkWriteOpResult))
            .catch(console.error.bind(console, 'City BULK update error:'))
        )
        return res.status(200).json({ someResult, anotherResult });
    }

    catch (err) {
        return res.status(400).json(err);
    }
};
// Ground.syncIndexes(function (err, res) {
//     if (err) {
//         console.log("Error", err);
//         return err;
//     }
//     console.log("Succes:", res);
//     return res;
// });

module.exports = {
    getGroundList,
    addNewGround
};