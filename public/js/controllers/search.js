define(['app',
        'services/resultsService',
        'services/RestaurantService'],
        function (app) {
    app.controller('rmSearch', ['$scope', 'rmResultsService', 'rmRestaurantService', '$location', "$anchorScroll", "$window",
    function($scope, $service, $restaurantService, $location, $anchorScroll, $window) {

        $scope.selected_restaurants = [];

        $scope.max_restaurants = 2;

        $scope.macros = {"calories": {"name": "Calories", "value": null},
                        "carbs": {"name": "Carbs", "value": null},
                        "fat": {"name": "Fat", "value": null},
                        "protein": {"name": "Protein", "value": null}};

        $scope.doSearch = function() {
            if(validateInput()) {
                $scope.$emit('hideAlert');
                $service.search({calories: $scope.macros.calories.value,
                                carbs: $scope.macros.carbs.value,
                                fat: $scope.macros.fat.value,
                                protein: $scope.macros.protein.value,
                                restaurants: $scope.selected_restaurants}).then(onSuccess, onError);
                $scope.showLoading = true;
            }
            else {
                return;
            }
        }

        function onSuccess(result) {
            $location.path('/results/');
        }

        function onError(result) {
            $scope.showLoading = false;
            // user did something they are not allowed to do
            if(result.status == 403) {
                $scope.$emit('showAlert', [result.data, "danger"]);
            }
        }

        function validateInput() {
            var found_error = false;
            $scope.no_rest_selected = false;
            for (var key in $scope.macros) {
                var macro = $scope.macros[key];
                if (!$scope.macros.hasOwnProperty(key)) {
                    continue;
                }

                if(macro.value < 0) {
                    macro.error = true;
                    macro.error_text = "Must be non-negative";
                    found_error = true;
                }
            }

            if($scope.selected_restaurants.length == 0) {
                $scope.no_rest_selected = true;
                found_error = true;
            }

            return !found_error;
        }

        $scope.displayText = function(item) {
            return item;
        }

        $scope.removeRestaurant = function(id) {
            $scope.selected_restaurants.splice($scope.selected_restaurants.indexOf)
        }

        $scope.updateRestaurants = function() {
            $restaurantService.load();
        }

        $scope.selectedRestChanged = function() {
            $scope.already_selected = null;
            $scope.no_rest_selected = false;
        }

        $restaurantService.get().then(
            function(result) {
                $scope.restaurants = result.data;

                // constructs the suggestion engine
                var engine = new Bloodhound({
                  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                  queryTokenizer: Bloodhound.tokenizers.whitespace,
                  local: $scope.restaurants
                });

                engine.initialize();

                $('.typeahead').typeahead({
                  hint: true,
                  highlight: false,
                  minLength: 1
                },
                {
                  name: 'restaurants',
                  displayKey: 'name',
                  source: engine
                });
            },
            function(result) {
                console.log(result);
            }
        );

        // when a restaurant is selected, clear box and add to list
        $('.typeahead').on('typeahead:selected', function(evt, item) {
            if($scope.selected_restaurants.indexOf(item) == -1 && $scope.selected_restaurants.length != $scope.max_restaurants) {
                $scope.$apply(function () {
                    $scope.already_selected = null;
                    $scope.selected_restaurants.push(item);
                    $scope.$emit('showAlert', ["Successfully added " + item.name, "success"]);
                });
                $('.typeahead').typeahead('val','');
            }
            else if($scope.selected_restaurants.length == $scope.max_restaurants) {
                $scope.$apply(function() {
                    $scope.$emit('showAlert', ["Sorry, you may only search for 5 restaurants at a time, try removing a restaurant first", "danger"]);
                    $scope.already_selected = null;
                });
            }
            else {
                $scope.$apply(function () {
                    $scope.already_selected = item.name;
                    $scope.$emit('showAlert', ["Already added " + item.name, "danger"]);
                });
            }
        });

        $scope.gotoAnchor = function() {
            $anchorScroll("restaurant");
        };

    }]);
});