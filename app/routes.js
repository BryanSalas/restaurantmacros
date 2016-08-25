// grab the nerd model we just created
var Nerd = require('./models/nerd');
var http = require('http');
var request = require('request');

    module.exports = function(app) {

        // server routes ===========================================================
        // handle things like api calls
        // authentication routes

        // sample api route
        app.get('/api/nerds', function(req, res) {
            // use mongoose to get all nerds in the database
            Nerd.find(function(err, nerds) {

                // if there is an error retrieving, send the error.
                                // nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.json(nerds); // return all nerds in JSON format
            });
        });

        app.post('/api/results', function(req, res) {
            request.post(
                'https://api.nutritionix.com/v1_1/search',
                { json:
                    {
                        "appId":"dba98fde",
                        "appKey":"adbe45626226708ccb7d85830347aada",
                        "offset": 0,
                        "limit": 50,
                        "fields":["item_name", "brand_id", "brand_name","nf_calories", "nf_total_carbohydrate", "nf_total_fat", "nf_protein"],
                        "filters": {
                            "brand_id": req.body.brand_id,
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
                        res.json(body);
                    }
                }
            );
        });

        // route to handle creating goes here (app.post)
        // route to handle delete goes here (app.delete)

        // frontend routes =========================================================
        // route to handle all angular requests
        app.get('*', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

    };