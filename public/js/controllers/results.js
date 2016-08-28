define(['app', 'services/resultsService'], function (app) {
    app.controller('rmResults', ['$scope', 'rmResultsService', '$location', function($scope, $service, $location) {
        $scope.results = $service.get();

        if(!$scope.results) {
            $location.path('/');
        }

        else {
            $scope.meals = [];
            $scope.selected_restaurant = $scope.results[0];
            $scope.addMeal = function() {
                if($scope.new_meal) {
                    $scope.meals.push({"name": $scope.new_meal, "calories": 0, "carbs": 0, "fat": 0, "protein": 0, "food": []});
                    $scope.new_meal = null;
                }
            }
        }

        $scope.selectRestaurant = function(result) {
            $scope.selected_restaurant = result;
        }
    }]);
});