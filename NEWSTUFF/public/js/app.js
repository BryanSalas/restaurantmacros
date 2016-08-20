define(['angularAMD', 'angular-route'], function (angularAMD) {
    var app = angular.module("sampleApp", ['ngRoute']);
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider

        .when("/", angularAMD.route({
           templateUrl: 'views/home.html',
           controller: 'rmHome',
           controllerUrl: 'controllers/home'
        }))

        $locationProvider.html5Mode(true);
    }]);

    return angularAMD.bootstrap(app);
});