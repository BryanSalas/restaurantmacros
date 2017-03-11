define(['app'], function (app) {
    app.factory('rmRestaurantService', ['$http', '$q', function($http, $q) {

        var restaurants = null;

        return {
            load : function() {
                var req = {
                    method: 'GET',
                    url: '/api/update_restaurants',
                }

                return $http(req).then(onSuccess, onError);

                function onSuccess(result) {
                    console.log("Successfully updated restaurants");
                }

                function onError(result) {
                    console.log(result);
                }
            },

            get : function() {
                if(restaurants == null) {
                    var req = {
                        method: 'GET',
                        url: '/api/restaurants'
                    }

                    return $http(req).then(function(result) {
                        restaurants = result.data
                        return restaurants;
                    });
                }
                else {
                    return $q.when(restaurants);
                }
            }
        }

    }]);
});