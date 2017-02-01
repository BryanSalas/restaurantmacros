define(['app'],
        function (app) {
    app.controller('rmAddItem', ['$scope', '$http',
    function($scope, $http) {
        $http.get("/api/item_schema").then(function(result) {
            $scope.schema = result.data.paths;
        });

        $http.get("/api/restaurants").then(function(result) {
            $scope.restaurants = result.data;
        });

        $scope.newItem = {};

        $scope.addItem = function() {
            $http.post("api/add_item", $scope.newItem).then(function(result) {
                $scope.serverErrors = {};
                $scope.message = "Successfully added " + $scope.newItem.name;
                $scope.newItem = {};
            }, function(result) {
                $scope.serverErrors = result.data;
            });
        }
    }
    ])
});