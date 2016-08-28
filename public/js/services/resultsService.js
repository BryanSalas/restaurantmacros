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

                return $http(req).then(onSuccess, onError);

                function onSuccess(result) {
                    for(index in result) {
                        curResult = result[index];

                    }
                    search_result = result.data;
                }

                function onError(result) {
                    console.log(result);
                    search_result = {};
                }
            },

            get : function() {
                return search_result;
            }
        }

    }]);
});