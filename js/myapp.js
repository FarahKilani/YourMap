var myApp = angular.module('myApp', ['ui.router']);


myApp.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('home', {
       url: '/home',
       templateUrl: 'home/home.html'
    })

    .state('page2', {
       url: '/page2',
       templateUrl: 'page2/page2.html'
    })

    .state('register', {
       url: '/register',
       templateUrl: 'register/register.html'
    })
    .state('seconnecter', {
       url: '/seconnecter',
       templateUrl: 'seconnecter/seconnecter.html'
    });
    $urlRouterProvider.otherwise('home');

});

// service d'authentification
myApp.service("userService", function($rootScope, $http) {
var ok=false;
var first, last;
    return {
        isConnected: function() {
         return(ok);
        },
        signIn: function(firstname,lastname) {

          var object = {'firstname' :firstname, 'name' :lastname };
          var objectjson=JSON.stringify(object);

          $http({
              method : "GET",
              url : "http://localhost:3000/utilisateurs",
            }).then(function mySuccess(response) {


              for (var i=0;i<response.data.length;i++)
              {
              ok = Object.keys(response.data[i]).some(function(firstname, name) {
               return ((response.data[i]['firstname'] ===object.firstname)&&(response.data[i]['name'] ===object.name)) ;
             });
                if (ok) {break;}
              }
                if (ok)
                {
                  alert("connecté");
                  ok=true;
                  $rootScope.$broadcast("connectionStateChanged");
                }
                else {alert("Mauvais identifients!");}

                }, function myError(response) {
                  alert(response.statusText);
           });
        },
        signOut: function() {
            // ...
            first='';
            last='';
            ok=false;
            $rootScope.$broadcast("connectionStateChanged");
        }
    };
});

myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function ($location) {
        return {
            'responseError': function (rejection) {
                if (rejection.status === 401) {
                    $location.url('/connexion?returnUrl=' + $location.path());
                }
            }
        };
    });
});

myApp.directive("showWhenConnected", function (userService) {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            var showIfConnected = function() {
                if(userService.isConnected()) {
                    $(element).show();
                } else {
                  $(element).hide();
                }
            };

            showIfConnected();
            $scope.$on("connectionStateChanged", showIfConnected);
        }
    };
});

myApp.directive("hideWhenConnected", function (userService) {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            var hideIfConnected = function() {
                if(userService.isConnected()) {
                    $(element).hide();
                } else {
                    $(element).show();
                }
            };

            hideIfConnected();
            $scope.$on("connectionStateChanged", hideIfConnected);
        }
    };
});


//the map directive

myApp.directive("myMaps",function ($http){
    return {
        restrict: 'E',
      /*  scope: {
           destination: "=ngModel"
       },*/
        template: '<div></div>',
        replace: true,
        link: function ($scope, element,attrs){

          var lat = 48.852969;
          var lon = 2.349903;
          var map = null;

/*  Afficher un marquer lors du clic
          var villes = {
            	"Paris": { "lat": 48.852969, "lon": 2.349903 },
            	"Brest": { "lat": 48.383, "lon": -4.500 },
            	"Quimper": { "lat": 48.000, "lon": -4.100 },
            	"Bayonne": { "lat": 43.500, "lon": -1.467 }
            };
            for (ville in villes) {
		          var marker = L.marker([villes[ville].lat, villes[ville].lon]).addTo(map);
              marker.bindPopup(ville);
	            }


*/


/*  Afficher le chemin optimal entre multiples destinations
              dir = MQ.routing.directions();

              dir.optimizedRoute({
              locations: [
              'syracuse ny',
              'ithaca ny',
              'springfield ma',
              'hartford ct'
              ]
            });map.removeLayer(this)

              map.addLayer(MQ.routing.routeLayer({
              directions: dir,
              fitBounds: true
              }));

//  recherche de lieux
/*
MQ.geocode().search('syracuse ny').on('success', function(e) {

  var best = e.result.best,
    latlng = best.latlng;

  map.setView(latlng, 12);
  L.marker([ latlng.lat, latlng.lng ])
      .addTo(map)
      .bindPopup('<strong>' + best.adminArea5 + ', ' + best.adminArea3 + '</strong>is located here.')
    .openPopup()
});

*/

var popup = L.popup(),
  geocode,
  map,
  content;
var listPlaces=[], coordPlaces=[], listLoisirs=[], coordLoisirs=[];

// création de la carte et gestion des lieux choisis au clic
map = L.map('map', {
//  layers: MQ.mapLayer(),
  center: [ lat, lon ],
  zoom: 9 }).on('click',mapManager);

function mapManager (e){
  var marker = L.marker([e.latlng.lat, e.latlng.lng],{draggable: true, riseOnHover:true}).addTo(map);
  listPlaces.push(marker);
  coordPlaces.push({ latLng: { lat: marker.getLatLng().lat, lng: marker.getLatLng().lng}});
  geocode.reverse(e.latlng);

  popup.setLatLng(e.latlng).openOn(this);
  //effet sur le marqueur
  marker.on('mouseover',onMouse);
  marker.on('mouseout', offMouse);
  marker.on('click', remove);
  //zooming sur les markers
  var group = new L.featureGroup(listPlaces);
  if (listPlaces.length>1) {
  map.fitBounds(group.getBounds());
}
}


geocode = MQ.geocode().on('success', function(e) {
  popup.setContent(geocode.describeLocation(e.result.best));
});

          // gestion des événement de clic et de passage sur le marqueur
function onMouse(e) {
 popup.setLatLng(e.latlng);
  geocode.reverse(e.latlng);
 setTimeout(myFunction,300, this);

};
//map.removeLayer(this);
 function offMouse(e) {
   geocode.reverse(e.latlng);
// popup.setLatLng(e.latlng).closeOn(map);
 map.closePopup();
};

function remove(e){
  var scale=map.getZoom();
  map.removeLayer(this);
  var index = listPlaces.indexOf(this);
  if (index > -1) {
    listPlaces.splice(index, 1);
  }
    coordPlaces.splice(index, 1);
  var coordPlaces1=[];
  for (var i=0; i<coordPlaces.length; i++)
  {
    coordPlaces1.push(coordPlaces[i]);
  }
  $scope.nettoyer();
  for (var i=0; i<coordPlaces1.length; i++)
  {
    coordPlaces.push(coordPlaces1[i]);
  }
setTimeout(reset,1000);
map.setZoom(scale);
};

function reset(){

for (var i=0; i<coordPlaces.length; i++)
{
  var marker = L.marker([coordPlaces[i].latLng.lat, coordPlaces[i].latLng.lng],{draggable: true, riseOnHover:true}).addTo(map);
  listPlaces.push(marker);
}
establish_route(coordPlaces);  var group = new L.featureGroup(listPlaces);
  if (listPlaces.length>1) {
  map.fitBounds(group.getBounds());
}
var group = new L.featureGroup(listPlaces);
if (listPlaces.length>1) {
map.fitBounds(group.getBounds());
}
};

function myFunction (marker){map.removeLayer(this);
  content =popup.getContent();
  marker.bindPopup('<strong>' + content + '</strong>is located here.')
.openPopup();
}

L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    // Il est toujours bien de laisser le lien vers la source des données
    attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
    minZoom: 1,
    maxZoom: 20
}).addTo(map);


// ajout d'un lieu à la main

$scope.ajouter = function() {
                //alert('inside mapsdirective()'+$scope.destination);
                MQ.geocode().search($scope.destination).on('success', function(e) {

                  var best = e.result.best,
                    latlng = best.latlng,
                    marker;

                  map.setView(latlng, 10);
                    marker=L.marker([ latlng.lat, latlng.lng ]).addTo(map)
                      .bindPopup('<strong>' + best.adminArea5 + ', ' + best.adminArea3 + '</strong>is located here.')
                    .openPopup()
                      listPlaces.push(marker);
                     coordPlaces.push({ latLng: { lat: marker.getLatLng().lat, lng: marker.getLatLng().lng}});
                      marker.on('click', remove);
                      var group = new L.featureGroup(listPlaces);
                      if (listPlaces.length>1) {
                      map.fitBounds(group.getBounds());}
                });
            };


// dessin du chemin optimal à priori (sans lieux de loisirs)


function establish_route(coordPlaces){
  dir = MQ.routing.directions();
  dir.optimizedRoute({
  locations: coordPlaces
});

  map.addLayer(MQ.routing.routeLayer({
  directions: dir,
  fitBounds: true
  }));
};

$scope.calculer = function() {
// route optimization
establish_route(coordPlaces);
}

// Réinitialiser la carte
$scope.nettoyer = function() {
for (var i=0; i<listPlaces.length ; i++)
{
  map.removeLayer(listPlaces[i]);
}
listPlaces=[];
coordPlaces=[];
map.remove();
map = L.map('map', {
//  layers: MQ.mapLayer(),
  center: [ lat, lon ],
  zoom: 9 }).on('click',mapManager);

L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
    minZoom: 1,
    maxZoom: 20
}).addTo(map);
}

// sauvegarder l'itinéraire
$scope.sauvegarder= function (){
 // sauvegarder coordPlaces; appel ajax

}


// Afficher les lieux d'intérêt
  $scope.choisir=function(){
    var code ="1PGOdUy0VI-rQdjVGQ9wNzsSYOzkN6F6nV-px-YfHJBI";
    Tabletop.init({
        key: code,
        callback: function(sheet, tabletop){

          for (var i in sheet){
            var data = sheet[i];

              var icon = L.icon({
                  iconUrl: data.icon,
                  iconSize:     [52, 60], // size of the icon
                  iconAnchor:   [26, 60], // point of the icon which will correspond to marker's location
                  popupAnchor: [0, -60]
              });
              if (data.iconori === "left") {
                icon = L.icon({
                  iconUrl: data.icon,
                  iconSize:     [60, 52],
                  iconAnchor:   [60, 26],
                  popupAnchor: [-35, -26]
                  });
              };
              if (data.iconori === "right") {
                icon = L.icon({
                  iconUrl: data.icon,
                  iconSize:     [60, 52],
                  iconAnchor:   [0, 26],
                  popupAnchor: [35, -26]
                  })
                };

              L.marker([data.longitude, data.latitude], {icon: icon})
              .addTo(map).on ('click', function (e){
                map.removeLayer(this);
                var marker = L.marker([e.latlng.lat, e.latlng.lng],{draggable: true, riseOnHover:true}).addTo(map).bindPopup("<strong style='color: #84b819'>" + data.newsroom + "</strong><br>" +
                            data.company + " | " + data.city + "<br>Head: " + data.head).openPopup();
;
                listPlaces.push(marker);
                coordPlaces.push({ latLng: { lat: marker.getLatLng().lat, lng: marker.getLatLng().lng}});
                alert("Destination ajoutée à votre itinéraire");

              })

              .bindPopup("<strong style='color: #84b819'>" + data.newsroom + "</strong><br>" +
                          data.company + " | " + data.city + "<br>Head: " + data.head).openPopup();

                          var group = new L.featureGroup(listPlaces);
                          if (listPlaces.length>1) {
                          map.fitBounds(group.getBounds());}

          }
        },
        simpleSheet: true
      });
      map.setZoom(10);
  }


  // Ajouter un lieu d'intérêt dans la base de données ouverte   (requete http)
  map.on('contextmenu',function(e){
    var description = prompt("Please enter description for the place:", "Place Name");
    if (description == null || description == "") {
    alert( "User cancelled the adding.");
  } else {
    // we add the locations
          var values = [
        ["2.427231", "48.624623", "", "une compagnie", "", "", "icons/Spiegel.png"],
      ];
      var body = {
        values: values,
        range:'A1'
      };
      //gapi.load('client:auth2', initClient);

/*
          gapi.client.sheets.spreadsheets.values.update({
             spreadsheetId: "1PGOdUy0VI-rQdjVGQ9wNzsSYOzkN6F6nV-px-YfHJBI",
             range: "A1",
             valueInputOption:'',
             resource: body
          }).then((response) => {
            var result = response.result;
            alert("good");
          });*/


          $http({
              method : "POST",
                //url:" https://sheets.googleapis.com/v4/spreadsheets/1PGOdUy0VI-rQdjVGQ9wNzsSYOzkN6F6nV-px-YfHJBI/values/A1:append",
              url: "https://docs.google.com/spreadsheets/d/1PGOdUy0VI-rQdjVGQ9wNzsSYOzkN6F6nV-px-YfHJBI/edit?usp=sharing",
              data:  body
          //  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function mySuccess(response) {
                  alert("Adding your location to database");
            }, function myError(response) {
              alert(response.statusText);
          });


  }
});

    function initClient(){
    gapi.client.init({
           'apiKey':"AIzaSyCRqhVhI4kBT7ts4Ws0nyxCkiRReaqd2Xs",
           'clientId':"179686951411-k7lkdcccs7jk32citiv2tr63aoohd2si.apps.googleusercontent.com",
           'scope':"'https://www.googleapis.com/auth/spreadsheets'",
           //'https://www.googleapis.com/auth/spreadsheets'

           'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4']
         }).then(function() {
           alert("client is good");
         },function myError(response) {
           //alert(response.statusText);
           alert("erroe with client");
       });

    }




     }
    };
});

//lien vers le spreadsheet : https://docs.google.com/spreadsheets/d/e/2PACX-1vQrcIzpAPsnYaKUs9_b4ddCx_qOdIuHZ6MgVdW0khnhXgEZBtZxlhLkzq_0zFkSsMDWD_evPmn1JyEd/pub?output=ods
// ID client sheets  "179686951411-k7lkdcccs7jk32citiv2tr63aoohd2si.apps.googleusercontent.com"
// code secret client "1aflbJIz_RY2RtUG0QnvR3YR"
