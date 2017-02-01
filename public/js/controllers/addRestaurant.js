define(['app'],
        function (app) {
    app.controller('rmAddRestaurant', ['$scope', '$http',
    function($scope, $http) {
        $http.get("/api/restaurant_schema").then(function(result) {
            $scope.schema = result.data.paths;
        });

        $scope.newRestaurant = {};

        $scope.addRestaurant = function() {
            $http.post("api/add_restaurant", $scope.newRestaurant).then(function(result) {
                $scope.serverErrors = {};
                $scope.message = "Successfully added " + $scope.newRestaurant.name;
                $scope.newRestaurant = {};
            }, function(result) {
                $scope.serverErrors = result.data;
            });
        }
    }
    ])
});