define(['app'], function (app) {
    app.controller('rmSignup', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
      // This object will be filled by the form
      $scope.user = {};

///////////////pick up here

      // Register the login() function
      $scope.login = function(){
        $http.post('/signup', {
          username: $scope.user.username,
          password: $scope.user.password,
        })
        .success(function(user){
          // No error: authentication OK
          $rootScope.message = 'Authentication successful!';
          $location.url('/admin');
        })
        .error(function(){
          // Error: authentication failed
          $rootScope.message = 'Authentication failed.';
          $location.url('/login');
        });
      };
    }]);
});