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

    app.controller('mainCtrl', function($scope, $rootScope, $location) {
	  $scope.nav_tabs = [
	    {label:'Home', route:'/'},
	    {label:'Search', route:'/search'}
	   ];

	  $scope.cur_tab = '/';

	  $rootScope.$on('$routeChangeSuccess', function(e, curr, prev) {
       $scope.cur_tab = $location.path();
    });

	});

    return angularAMD.bootstrap(app);
});