define(['angularAMD',
        'angular-route',
        'bootstrap',
        'typeahead',
        'bloodhound'],
        function (angularAMD) {
    var app = angular.module("app", ['ngRoute']);
    app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider, $rootScope) {

        //================================================
        // Check if the user is connected
        //================================================
        var checkLoggedin = function($q, $http, $location, $rootScope){
          // Initialize a new promise
          var deferred = $q.defer();

          // Make an AJAX call to check if the user is logged in
          $http.get('/loggedin').success(function(user){
            // Authenticated
            if (user !== "0") {
              $rootScope.loggedInUser = user;
              console.log(user);
              deferred.resolve();
            }

            // Not Authenticated
            else {
              $rootScope.message = 'You need to log in.';
              $rootScope.loggedInUser = null;
              deferred.reject();
              console.log("not logged in");
              $location.url('/login');
            }
          });

          return deferred.promise;
        };

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

        .when("/profile", angularAMD.route({
           templateUrl: 'views/profile.html',
           controller: 'rmProfile',
           controllerUrl: 'controllers/profile',
           resolve: { loggedin: checkLoggedin }
        }))

        .otherwise("/");

        $locationProvider.html5Mode(true);
    }]);

    app.controller('mainCtrl', function($scope, $rootScope, $location, $timeout, $http, $window) {

        // check if user logged in
        $http.get('/loggedin').success(function(user){
            // Authenticated
            if (user !== "0") {
              $rootScope.loggedInUser = user;
            }

            // Not Authenticated
            else {
              $rootScope.loggedInUser = null;
            }
        });

        $scope.user = {};

        $scope.showLoginModal = function() {
            $scope.showModal = "login";
        }

        $scope.showSignupModal = function() {
            $scope.showModal = "signup";
        }

        $scope.signup = function(){
            $http.post('/signup', {
              email: $scope.user.email,
              password: $scope.user.password,
            })
            .success(function(user){
              // No error: authentication OK
              $rootScope.message = 'Authentication successful!';
              $location.url('/profile');
            })
            .error(function(){
              // Error: authentication failed
              $rootScope.message = 'Authentication failed.';
            });
        };

        $scope.login = function(){
            $http.post('/login', {
              email: $scope.user.username,
              password: $scope.user.password,
            })
            .success(function(user){
              $location.url('/profile');
            })
            .error(function(){
              console.log("error logging in");
            });
        };

        $scope.logout = function() {
	        $http.post("/logout").then(function(result) {
	            // reload page
	            $window.location.reload();
	        }, function(result) {
	            // error logging out
	            console.log(result);
	        });
	    }

        $scope.hide_alert = true;
	    $scope.nav_tabs = [
	        {label:'Home', route:'/'},
	        {label:'Search', route:'/search'}
	    ];

	    $scope.nav_tabs_right_no_auth = [
	        {label:'Log in', route:'/login'},
	        {label:'Signup', route:'/signup'}
	    ]

	    $scope.nav_tabs_right_auth = [
	        {label:'Profile', route:'/profile'}
	    ]

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