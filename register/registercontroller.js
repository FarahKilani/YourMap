myApp.controller('RegisterController', ["$scope", "$state", "$http",

  function($scope, $state, $http) {
    $scope.gotopage2 = function() {
          $state.go("page2");
          }
  $scope.seconnecter = function() {

         $state.go("seconnecter");
            }
          $scope.firstname = '';
          $scope.lastname='';

          $scope.ajouter = function() {
          //  $state.go("page2");

            var object = {'firstname' :$scope.firstname, 'name' : $scope.lastname  };
            var objectjson=JSON.stringify(object);


            $http({
                method : "POST",
                url : "http://localhost:3000/utilisateurs",
                data: objectjson
              }).then(function mySuccess(response) {
                    alert("Element ajouté avec succès!");
                  }, function myError(response) {
                    alert(response.statusText);
             });
}}
]);
