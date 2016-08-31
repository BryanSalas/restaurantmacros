define(['app',
        'services/resultsService',
        'services/RestaurantService'],
        function (app) {
    app.controller('rmSearch', ['$scope', 'rmResultsService', 'rmRestaurantService', '$location',
    function($scope, $service, $restaurantService, $location) {

        $scope.selected_restaurants = [];

        $scope.macros = {"calories": {"name": "Calories", "value": null},
                        "carbs": {"name": "Carbs", "value": null},
                        "fat": {"name": "Fat", "value": null},
                        "protein": {"name": "Protein", "value": null}};

        $scope.doSearch = function() {
            $service.search({calories: $scope.macros.calories.value,
                            carbs: $scope.macros.carbs.value,
                            fat: $scope.macros.fat.value,
                            protein: $scope.macros.protein.value,
                            brands: $scope.selected_restaurants}).then(onSuccess, onError);
        }

        function onSuccess(result) {
            $location.path('/results/');
        }

        function onError(result) {
            console.log("error");
        }

        $scope.displayText = function(item) {
            return item;
        }

        $scope.updateRestaurants = function() {
            $restaurantService.load();
        }

        $scope.selectedRestChanged = function() {
            $scope.already_selected = null;
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
            if($scope.selected_restaurants.indexOf(item) == -1) {
                $scope.$apply(function () {
                    $scope.already_selected = null;
                    $scope.selected_restaurants.push(item);
                });
                $('.typeahead').typeahead('val','');
            }
            else {
                $scope.$apply(function () {
                    $scope.already_selected = item.name;
                });
            }
        });

    }]);
});