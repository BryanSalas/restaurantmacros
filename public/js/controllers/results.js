define(['app', 'services/resultsService'], function (app) {
    app.controller('rmResults', ['$scope', 'rmResultsService', '$location', '$window',
    function($scope, $service, $location, $window) {
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

        $scope.tab_selected = "food";

        $scope.selectRestaurant = function(result) {
            $scope.selected_restaurant = result;
        }

        // handle fixed header
        angular.element($window).bind("scroll", function() {
            if (this.pageYOffset >= 77) {
                $scope.fixed_header = true;
            } else {
                $scope.fixed_header = false;
            }
            $scope.fixed_width = {'width': $('.food-header').width() + "px"};
            $scope.$apply();
        });
    }]);
});