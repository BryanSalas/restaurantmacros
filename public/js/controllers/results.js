define(['app', 'services/resultsService'], function (app) {
    app.controller('rmResults', ['$scope', 'rmResultsService', function($scope, $service) {
        $scope.hits = $service.get().hits;
    }]);
});