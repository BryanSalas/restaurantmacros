define(['app', 'services/resultsService'], function (app) {
    app.controller('rmResults', ['$scope', 'rmResultsService', '$location', '$window',
    function($scope, $service, $location, $window) {
        $scope.foodHeaders = [
            {"key": "restaurant", "name": "Rest"},
            {"key": "name", "name": "Food"},
            {"key": "calories", "name": "Cal"},
            {"key": "carbs", "name": "C"},
            {"key": "fat", "name": "F"},
            {"key": "protein", "name": "P"}
        ];

        $scope.results = $service.get();

        if(!$scope.results) {
            $location.path('/');
        }

        else {
            $scope.widths = {};

            $scope.sortBy = function(sort) {
                if($scope.order == sort) {
                    $scope.order = "-"+$scope.order;
                }
                else {
                    $scope.order = sort;
                }
            };
            $scope.fixed_width = {'width': $('.food-header').width() + "px"};

            // handle fixed header
            angular.element($window).bind("scroll", function() {
                if (this.pageYOffset >= 85) {
                    $scope.fixedHeader = true;
                } else {
                    $scope.fixedHeader = false;
                }
                $scope.fixedWidth = {'width': $('.food-header').width() + "px"};

                for(i = 0; i < $scope.foodHeaders.length; i++) {
                    var key = $scope.foodHeaders[i].key;
                    var padding = $('.' + key + '-header').css("padding");
                    padding = padding.replace("px", "");
                    $scope.widths[key] = {'width': $('.' + key + '-header').width() + padding*2 + "px"}
                }

                $scope.$apply();
            });
        }

        $scope.$on('$destroy', function() {
            angular.element($window).unbind("scroll");
        });
    }]);
});