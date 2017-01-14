var Restaurant = require('./models/restaurant');
var ApiKey = require('./models/apiKey');
var http = require('http');
var request = require('request');

    module.exports = function(app) {

        // set Nutritionix APP_ID and APP_KEY
        ApiKey.find({}, function(err, docs) {
            if (!err){
                app.locals.APP_ID = docs[0]._id;
                app.locals.APP_KEY = docs[0].appKey;
            }
            else {
                throw err;
            }
        });

        // server routes ===========================================================

        app.post('/api/results', function(req, res) {
            // validate that only 5 restaurants are searched for
            if (req.body.brands.length > 5) {
                res.status(403).send('Sorry, you may only search for 5 restaurants at a time, try removing a restaurant first');
                return;
            }
            var results = [];
            for(index in req.body.brands) {
                searchRestaurant(req.body.brands[index]._id, req.body.brands[index].name, 0, {});
            }
            function searchRestaurant(brand_id, brand_name, curOffset, all_hits) {
                request.post(
                    'https://api.nutritionix.com/v1_1/search',
                    { json:
                        {
                            "appId": app.locals.APP_ID,
                            "appKey": app.locals.APP_KEY,
                            "offset": curOffset,
                            "limit": 50,
                            "fields":["item_name", "brand_id",
                                "brand_name","nf_calories", "nf_total_carbohydrate", "nf_total_fat", "nf_protein"],
                            "filters": {
                                "brand_id": brand_id,
                                "nf_calories": {
                                    "lte": req.body.calories
                                },
                                "nf_total_carbohydrate": {
                                    "lte": req.body.carbs
                                },
                                "nf_total_fat": {
                                    "lte": req.body.fat
                                },
                                "nf_protein": {
                                    "lte": req.body.protein
                                }
                            }
                        }
                    },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            // found all items that match query
                            if(curOffset > body.total) {
                                all_hits["brand_id"] = brand_id;
                                all_hits["brand_name"] = brand_name;
                                results.push(all_hits);

                                // final set of results, return array of results
                                if(results.length == req.body.brands.length) {
                                    res.json(results);
                                }
                            }
                            // still have more matches to add to hits
                            else {
                                if(curOffset == 0) {
                                    all_hits = body;
                                }
                                else {
                                    all_hits["hits"] = all_hits["hits"].concat(body.hits);
                                }
                                curOffset += 50;
                                searchRestaurant(brand_id, brand_name, curOffset, all_hits);
                            }

                        }
                        else {
                            res.sendStatus(500);
                        }
                    }
                );
            }
        });

        // update restaurants
        app.get('/api/update_restaurants', function(req, res) {

            getBatchRestaurants(0);
            var curOffset = 0;
            var updatedCount = 0;

            function getBatchRestaurants(offset) {
                var url = "https://api.nutritionix.com/v1_1/brand/search?type=1&min_score=1&offset=" + offset +
                "&limit=50&appId=" + app.locals.APP_ID + "&appKey=" + app.locals.APP_KEY;
                request({url: url, json: true}, callback);
            }

            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var hits = body.hits;
                    for (index in hits) {
                        var curHit = hits[index];
                        findRestaurant(curHit);
                    }
                    curOffset += 50;
                    getBatchRestaurants(curOffset);
                }
                else {
                    res.json({updated: updatedCount});
                }
            }

            function findRestaurant(curHit) {
                Restaurant.find({_id : curHit._id}, function(err, docs) {
                    // restaurant not in db
                    if(docs.length == 0) {
                        updatedCount += 1;
                        var rest = new Restaurant({_id: curHit._id, name: curHit.fields.name, website: curHit.fields.website});
                        rest.save(function(err, rest) {
                            if(err) return console.error(err);
                            console.log("Added " + curHit.fields.name);
                        });
                    }
                });
            }
        });

        // get all restaurants
        app.get('/api/restaurants', function(req, res) {
            Restaurant.find({}, function(err, docs) {
                if(!err) {
                    res.json(docs);
                }
                else {
                    res.json({});
                }
            })
        });

        // route to handle delete goes here (app.delete)

        // frontend routes =========================================================
        // route to handle all angular requests
        app.get('*', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

    };