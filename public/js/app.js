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

        .when("/results", angularAMD.route({
           templateUrl: 'views/results.html',
           controller: 'rmResults',
           controllerUrl: 'controllers/results'
        }))

        $locationProvider.html5Mode(true);
    }]);

    return angularAMD.bootstrap(app);
});