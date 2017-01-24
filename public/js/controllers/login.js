define(['app'], function (app) {
    app.controller('rmLogin', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {

      if($rootScope.loggedInUser) {
        $location.url("/");
      }

      ////////////// PICK UP HERE

      console.log($location.search());

      // This object will be filled by the form
      $scope.user = {};
      $rootScope.showNav = false;

      // Register the login() function
      $scope.login = function(){
        $http.post('/login', {
          email: $scope.user.username,
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
          $location.url('/login');
        });
      };
    }]);
});