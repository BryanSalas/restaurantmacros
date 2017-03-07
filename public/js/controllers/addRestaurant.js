define(['app'],
        function (app) {
    app.controller('rmAddRestaurant', ['$scope', '$http',
    function($scope, $http) {

        $scope.newRestaurant = {};

        $http.get("api/restaurant_schema").then(function(result) {
            $scope.schema = result.data.paths;
        });

        $scope.addRestaurant = function() {
            $http.post("api/add_restaurant", $scope.newRestaurant).then(function(result) {
            }, function(result) {
                $scope.serverErrors = result.data;
                $scope.newRestaurant = {};
            });
        }
    }
    ])
});