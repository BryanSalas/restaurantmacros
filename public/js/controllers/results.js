define(['app', 'services/resultsService'], function (app) {
    app.controller('rmResults', ['$scope', 'rmResultsService', '$location', '$window',
    function($scope, $service, $location, $window) {
        $scope.food_headers = [{'key': 'item_name', 'name': 'Food'},
                               {'key': 'nf_calories', 'name': 'Calories'},
                               {'key': 'nf_total_carbohydrate', 'name': 'Carbs'},
                               {'key': 'nf_total_fat', 'name': 'Fat'},
                               {'key': 'nf_protein', 'name': 'Protein'}];

        $scope.meal_headers = [{'key': 'name', 'name': 'Meal'},
                               {'key': 'calories', 'name': 'Calories'},
                               {'key': 'carbs', 'name': 'Carbs'},
                               {'key': 'fat', 'name': 'Fat'},
                               {'key': 'protein', 'name': 'Protein'}];

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

            $scope.tab_selected = "food";

            $scope.selectRestaurant = function(result) {
                $scope.selected_restaurant = result;
            }

            $scope.addToMeal = function(food, index) {
                $scope.meals[index].food.push(food);
                $scope.meals[index].calories += food.nf_calories;
                $scope.meals[index].carbs += food.nf_total_carbohydrate;
                $scope.meals[index].fat += food.nf_total_fat;
                $scope.meals[index].protein += food.nf_protein;
            }

            // sort by name by default
            $scope.food_sort_by = "item_name";
            $scope.meal_sort_by = "name";

            $scope.sortBy = function(new_sort_by, food_sort) {
                // sorting food table
                if(food_sort) {
                    // clicked header that is already sorted, sort in other order
                    if(new_sort_by == $scope.food_sort_by) {
                        $scope.food_reverse_order = !$scope.food_reverse_order;
                        return;
                    }
                    else {
                        $scope.food_sort_by = new_sort_by;
                        $scope.food_reverse_order = false;
                    }
                }
                else {
                    // clicked header that is already sorted, sort in other order
                    if(new_sort_by == $scope.meal_sort_by) {
                        $scope.meal_reverse_order = !$scope.meal_reverse_order;
                        return;
                    }
                    else {
                        $scope.meal_sort_by = new_sort_by;
                        $scope.meal_reverse_order = false;
                    }
                }

            }

            $scope.fixed_width = {'width': $('.food-header').width() + "px"};

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
        }
    }]);
});