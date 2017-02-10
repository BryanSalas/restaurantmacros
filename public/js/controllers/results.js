define(['app', 'services/resultsService'], function (app) {
    app.controller('rmResults', ['$scope', 'rmResultsService', '$location', '$window',
    function($scope, $service, $location, $window) {
        $scope.food_headers = [
            {"key": "restaurant_name", "name": "Restaurant"},
            {"key": "name", "name": "Food"},
            {"key": "calories", "name": "Calories"},
            {"key": "carbs", "name": "Carbs"},
            {"key": "fat", "name": "Fat"},
            {"key": "protein", "name": "Protein"}
        ];

        //$scope.results = $service.get();

        $scope.results = [
            {
                "_id":"589bd4d90467500821ca9931",
                "restaurant":{"_id":"589bb881a0d61ec01608dff0","name":"chilis","website":"chilis.com","__v":0},
                "name":"fries",
                "calories":400,
                "protein":4,
                "fat":20,
                "carbs":23,
                "__v":0
            },
            {
                "_id":"589d298f2241a1ac141b82fe",
                "restaurant":{"_id":"589bc18570af86301ff21207","name":"freebirds","website":"freebirds.com","__v":0},
                "name":"burrito",
                "calories":1000,
                "protein":12,
                "fat":12,
                "carbs":203,
                "__v":0
            }
        ]


        if(!$scope.results) {
            $location.path('/');
        }

        else {
            $scope.selected_restaurant = $scope.results[0];
            $scope.selected_restaurant.meals = [];
            $scope.selected_restaurant.search = "";
            $scope.selected_restaurant.tab_selected = "food";

            $scope.selectRestaurant = function(result) {
                $scope.selected_restaurant = result;
                if(!$scope.selected_restaurant.meals) {
                    $scope.selected_restaurant.meals = [];
                }

                if(!$scope.selected_restaurant.tab_selected) {
                    $scope.selected_restaurant.tab_selected = "food";
                }

                if(!$scope.selected_restaurant.search) {
                    $scope.selected_restaurant.search = "";
                }
            }

            // meals
            $scope.addMeal = function() {
                if($scope.selected_restaurant.new_meal) {
                    $scope.selected_restaurant.meals.push({"name": $scope.selected_restaurant.new_meal, "calories": 0,
                    "carbs": 0, "fat": 0, "protein": 0, "food": [], "open": false});
                    if($scope.food_to_add) {
                    $scope.addToMeal($scope.food_to_add, $scope.selected_restaurant.meals.length - 1);
                    }
                    $scope.selected_restaurant.new_meal = null;
                    $scope.food_to_add = null;
                }
            }

            $scope.createMealFromFood = function(food) {
                $scope.selected_restaurant.tab_selected = "meals";
                $scope.food_to_add = food;
            }

            $scope.addToMeal = function(food, index) {
                $scope.selected_restaurant.meals[index].food.push(food);
                $scope.selected_restaurant.meals[index].calories += food.nf_calories;
                $scope.selected_restaurant.meals[index].carbs += food.nf_total_carbohydrate;
                $scope.selected_restaurant.meals[index].fat += food.nf_total_fat;
                $scope.selected_restaurant.meals[index].protein += food.nf_protein;
            }

            $scope.removeFood = function(meal, index) {
                meal.calories -= meal.food[index].nf_calories;
                meal.carbs -= meal.food[index].nf_total_carbohydrate;
                meal.fat -= meal.food[index].nf_total_fat;
                meal.protein -= meal.food[index].nf_protein;

                meal.food.splice(index, 1);
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
                if (this.pageYOffset >= 85) {
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