define(['app'],
        function (app) {
    app.controller('rmAddItem', ['$scope', '$http',
    function($scope, $http) {
        $http.get("/api/itemSchema").then(function(result) {
            $scope.schema = result.data.paths;
        });

        $http.get("/api/restaurants").then(function(result) {
            $scope.restaurants = result.data;
        });

        $scope.newItem = {};

        $scope.addItem = function() {
            $http.post("api/addItem", $scope.newItem).then(function(result) {
                $scope.serverErrors = {};
            }, function(result) {
                $scope.serverErrors = result.data;
            });
        }
    }
    ])
});