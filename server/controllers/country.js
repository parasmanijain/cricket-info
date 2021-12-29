const { Country } = require('../models/schemaModel');

const getCountryList = (req, res) => {
    Country.aggregate(
        [
            {
                "$project": {
                    "name": 1
                }
            },
            { "$sort": { "name": 1 } }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        })
};

const getCountryCityList = (req, res) => {
    Country.aggregate(
        [
            {
                "$lookup": {
                    "from": 'cities',
                    "let": { "cities": "$cities" },
                    "as": 'cities',
                    "pipeline": [
                        {
                            "$match": { "$expr": { "$in": ["$_id", "$$cities"] } }

                        },
                        { "$sort": { "name": 1 } }

                    ]
                }
            }, {
                "$project": {
                    "name": 1,
                    "cities": {
                        "$map": {
                            "input": "$cities",
                            "as": "c",
                            "in": {
                                "name": "$$c.name",
                                "_id": "$$c._id"
                            }
                        }
                    }
                }
            },
            { "$sort": { "name": 1 } }
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        })
};

const getCountryGroundList = (req, res) => {
    // get data from the view and add it to mongodb
    Country.find({}, null, { sort: { name: 1 } })
        .populate({ path: 'cities', options: { sort: { 'name': 1 } }, populate: [{ path: 'grounds', options: { sort: { 'name': 1 } } }] })
        .exec(function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        });
};

const getCountryGroundCount = (req, res) => {
    // get data from the view and add it to mongodb
    Country.aggregate(
        [
            {
                "$lookup": {
                    "from": "cities",
                    "let": { "cities": "$cities" },
                    "pipeline": [
                        { "$match": { "$expr": { "$in": ["$_id", "$$cities"] } } },
                        {
                            "$lookup": {
                                "from": "grounds",
                                "let": { "grounds": "$grounds" },
                                "pipeline": [
                                    { "$match": { "$expr": { "$in": ["$_id", "$$grounds"] } } },
                                    { "$sort": { "name": 1 } }
                                ],
                                "as": "grounds"
                            }
                        },
                        { "$sort": { "name": 1 } }
                    ],
                    "as": "cities"
                }
            },
            {
                "$project": {
                    "name": 1,
                    "city": {
                        "$map": {
                            "input": "$cities",
                            "as": "c",
                            "in": {
                                "name": "$$c.name",
                                "ground": {
                                    "$map": {
                                        "input": "$$c.grounds",
                                        "as": "g",
                                        "in": {
                                            "name": "$$g.name",
                                            "length": {
                                                "$size": "$$g.matches"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { "$sort": { "name": 1 } },
        ],
        function (err, results) {
            if (err) return res.send(500, { error: err });
            return res.send(results);
        }
    )
};

const addNewCountry = (req, res) => {
    // get data from the view and add it to mongodb
    var query = { 'name': req.body.name };
    const existing = req.body;
    Country.findOneAndUpdate(query, existing, {
        upsert: true,
        useFindAndModify: false
    }, (err, doc) => {
        if (err) return res.send(500, { error: err });
        return res.send('New Country Succesfully added.');
    });
}

module.exports = {
    getCountryList,
    getCountryCityList,
    getCountryGroundList,
    getCountryGroundCount,
    addNewCountry
};