define(['app'], function (app) {
    app.factory('rmResultsService', ['$http', function($http) {

        var search_result = null;

        return {
            // search for data
            search : function(reqData) {
                var req = {
                    method: 'POST',
                    url: '/api/results',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    data: reqData
                }

                return $http(req).then(onSuccess);

                // let caller handle error case
                function onSuccess(result) {
                    search_result = result.data;
                }

            },

            get : function() {
                return search_result;
            }
        }

    }]);
});