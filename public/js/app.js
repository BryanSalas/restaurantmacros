define(['angularAMD',
        'angular-route',
        'bootstrap',
        'typeahead',
        'bloodhound'],
        function (angularAMD) {
    var app = angular.module("sampleApp", ['ngRoute']);
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider

        .when("/", angularAMD.route({
           templateUrl: 'views/home.html',
           controller: 'rmHome',
           controllerUrl: 'controllers/home'
        }))

        .when("/search", angularAMD.route({
           templateUrl: 'views/search.html',
           controller: 'rmSearch',
           controllerUrl: 'controllers/search'
        }))

        .when("/results", angularAMD.route({
           templateUrl: 'views/results.html',
           controller: 'rmResults',
           controllerUrl: 'controllers/results'
        }))

        $locationProvider.html5Mode(true);
    }]);

    app.controller('mainCtrl', function($scope, $rootScope, $location, $timeout) {
        $scope.hide_alert = true;
	    $scope.nav_tabs = [
	        {label:'Home', route:'/'},
	        {label:'Search', route:'/search'}
	    ];

	    $scope.cur_tab = '/';

	    $rootScope.$on('$routeChangeSuccess', function(e, curr, prev) {
            $scope.cur_tab = $location.path();
            $scope.hideAlert();
        });

        $scope.$on('showAlert', function(event, args) {
            $timeout.cancel($scope.hide_alert_promise);
            $('#alert-box').removeClass("alert-" + $scope.alert_type);
            $scope.alert_text = args[0];
            $scope.alert_type = args[1];
            $scope.hide_alert = false;
            $('#alert-box').addClass("alert-" + $scope.alert_type);
            // hide alert box after 1.5 sec
            if($scope.alert_type != 'danger') {
                 $scope.hide_alert_promise = $timeout(function() {
                    $scope.hideAlert();
                }, 1500);
            }
        });

        $scope.hideAlert = function() {
            $scope.hide_alert = true;
            $('#alert-box').removeClass("alert-" + $scope.alert_type);
        }

        $scope.$on('hideAlert', function(event, args) {
            $scope.hideAlert();
        });

	});

    return angularAMD.bootstrap(app);
});