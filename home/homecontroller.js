myApp.controller('HomeController', ["$scope", "$state", "$http",

  function($scope, $state, $http) {
    $scope.gotopage2 = function() {
          $state.go("page2");
          }

    $scope.gotoregister = function() {
          $state.go("register");
                    }

    $scope.gotoseconnecter = function() {
          $state.go("seconnecter");
          }
    console.log('this is the homecontroller, hi!');
    var ok=false;

    $scope.firstname = '';
    $scope.lastname='';

    $scope.ajouter = function() {
    //  $state.go("page2");

      var object = {'firstname' :$scope.firstname, 'name' : $scope.lastname  };
      var objectjson=JSON.stringify(object);


      $http({
          method : "POST",
          url : "http://localhost:3000/students",
          data: objectjson
        }).then(function mySuccess(response) {
              alert("Element ajouté avec succès!");
            }, function myError(response) {
              alert(response.statusText);
       });


      $scope.supprimer = function() {
      //  $state.go("page2");



        var object = {'firstname' :$scope.liste[$scope.id].firstname, 'name' : $scope.liste[$scope.id].name };
        var objectjson=JSON.stringify(object);

        $http({
            method : "DELETE",
            url : "http://localhost:3000/students/" + $scope.id,
            //data: objectjson
          }).then(function mySuccess(response) {
                alert("Element supprimé avec succès!");
              }, function myError(response) {
                alert(response.statusText);
         });

         $scope.refresh($http);

        }

    $scope.refresh = function($http) {
      $http({
      method : "GET",
      url : "http://localhost:3000/students"
    }).then(function mySuccess(response) {
          $scope.liste = response.data;
        }, function myError(response) {
          $scope.liste = response.statusText;
        });
      };

    $scope.refresh($http);

  }

}
]);
