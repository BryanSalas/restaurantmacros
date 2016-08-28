define(['app'], function (app) {
    app.factory('rmRestaurantService', ['$http', function($http) {

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
                var req = {
                    method: 'GET',
                    url: '/api/restaurants'
                }

                return $http(req);
            }
        }

    }]);
});