define(['app'], function (app) {
    app.controller('rmLogin', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {

        // if user is logged in, redirect to profile page
        if($rootScope.loggedInUser) {
            $location.url("/profile");
        }

        if($location.search().email_in_use) {
            console.log("email in use");
        }

        $scope.user = {};

        $scope.login = function(){
            $http.post('/login', {
              email: $scope.user.username,
              password: $scope.user.password,
            })
            .success(function(user){
              $location.url('/profile');
            })
            .error(function(){
              $location.url('/login');
            });
        };
    }]);
});