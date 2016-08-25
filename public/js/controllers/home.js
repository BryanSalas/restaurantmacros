define(['app', 'services/resultsService'], function (app) {
    app.controller('rmHome', ['$scope', 'rmResultsService', '$location', function($scope, $service, $location) {
        $scope.header = "Counting macros, made easy.";
        $scope.macros = {"calories": {"name": "Calories", "value": null},
                        "carbs": {"name": "Carbs", "value": null},
                        "fat": {"name": "Fat", "value": null},
                        "protein": {"name": "Protein", "value": null}};

        $scope.doSearch = function() {
            $service.search({calories: $scope.macros.calories.value,
                            carbs: $scope.macros.carbs.value,
                            fat: $scope.macros.fat.value,
                            protein: $scope.macros.protein.value,
                            brand_id: "513fbc1283aa2dc80c000053"}).then(onSuccess, onError);
        }

        function onSuccess(result) {
            $location.path('/results/');
        }

        function onError(result) {
            console.log("error");
        }
    }]);
});