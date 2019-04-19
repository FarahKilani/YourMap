myApp.controller('SeconnecterController', ["$scope", "$state", "$http","userService","$window",

  function($scope, $state, $http,userService, $window) {

    $scope.gotohome = function() {
    $state.go("home");
    }

    $scope.seconnecter = function() {
     userService.signIn($scope.firstname, $scope.lastname);
   }

   $scope.verify = function(){
     if (userService.isConnected()){
        console.log("ur connected!");
      $state.go("page2");
      }
   }

   $scope.sedeconnecter = function() {
    userService.signOut();
  }
    }
]);
