define(['angularAMD',
        'angular-route',
        'bootstrap',
        'typeahead',
        'bloodhound'],
        function (angularAMD) {
    var app = angular.module("app", ['ngRoute']);
    app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {

        //================================================
        // Check if the user is connected
        //================================================
        var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
          // Initialize a new promise
          var deferred = $q.defer();

          // Make an AJAX call to check if the user is logged in
          $http.get('/loggedin').success(function(user){
            // Authenticated
            if (user !== '0')
              /*$timeout(deferred.resolve, 0);*/
              deferred.resolve();

            // Not Authenticated
            else {
              $rootScope.message = 'You need to log in.';
              //$timeout(function(){deferred.reject();}, 0);
              deferred.reject();
              $location.url('/login');
            }
          });

          return deferred.promise;
        };

        //================================================
        // Add an interceptor for AJAX errors
        //================================================
        $httpProvider.interceptors.push(function($q, $location) {
          return {
            response: function(response) {
              // do something on success
              return response;
            },
            responseError: function(response) {
              if (response.status === 401)
                $location.url('/login');
              return $q.reject(response);
            }
          };
        });

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

        .when("/login", angularAMD.route({
           templateUrl: 'views/login.html',
           controller: 'rmLogin',
           controllerUrl: 'controllers/login'
        }))

        .when("/signup", angularAMD.route({
           templateUrl: 'views/signup.html',
           controller: 'rmSignup',
           controllerUrl: 'controllers/signup'
        }))

        $locationProvider.html5Mode(true);
    }]);

    app.controller('mainCtrl', function($scope, $rootScope, $location, $timeout) {
        $scope.hide_alert = true;
	    $scope.nav_tabs = [
	        {label:'Home', route:'/'},
	        {label:'Search', route:'/search'}
	    ];

	    $scope.nav_tabs_right = [
	        {label:'Log in', route:'/login'}
	    ]

	    $scope.cur_tab = '/';

	    $rootScope.$on('$routeChangeSuccess', function(e, curr, prev) {
            $scope.cur_tab = $location.path();
            $scope.hideAlert();
        });

        // Logout function is available in any pages
        $rootScope.logout = function(){
            $rootScope.message = 'Logged out.';
            $http.post('/logout');
        };

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