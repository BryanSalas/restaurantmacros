define(['app'], function (app) {
    app.controller('rmSignup', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
      // This object will be filled by the form
      $scope.user = {};

      // Register the login() function
      $scope.signup = function(){
        console.log("signingup");
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
          $location.url('/signup');
        });
      };
    }]);
});