// MyChat App - Ionic & Firebase Demo

var firebaseUrl = "https://aubg.firebaseIO.com/";
var ref = new Firebase(firebaseUrl);
function onDeviceReady() {
    angular.bootstrap(document, ["mychat"]);
}
document.addEventListener("deviceready", onDeviceReady, false);

// 'mychat.services' is found in services.js
// 'mychat.controllers' is found in controllers.js
var app = angular.module('mychat', ['ionic', 'firebase', 'angularMoment', 'mychat.controllers', 'mychat.services','angles','ngCordova'])

.run(function ($ionicPlatform, $rootScope, $location, Auth, $ionicLoading, $ionicHistory, $timeout, $cordovaStatusbar) {
    $ionicPlatform.ready(function () {


        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.style(1)

        }
        // To Resolve Bug
        ionic.Platform.fullScreen();

        $rootScope.firebaseUrl = firebaseUrl;
        $rootScope.user = null;



        Auth.$onAuth(function (authData) {
            if (authData) {
                console.log("Logged in as:", authData.uid);
            } else {
                console.log("Logged out");
                $ionicLoading.hide();
                $location.path('/login');
            }
        });

        $rootScope.logout = function () {
            console.log("Logging out from the app");
            $ionicLoading.show({
                template: 'Logging Out...'
            });
            Auth.$unauth();
        }
        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });

        try {
            cordova.plugins.Keyboard.disableScroll(true);
            }catch(e) {
            console.log("NOT IOS: "+e);
            }
    });
})

.config(function ($stateProvider, $urlRouterProvider) {
    console.log("setting config");
    $stateProvider

    .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl',
        resolve: {
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return Auth.$waitForAuth();
                                }
                           ]
        }
    })
    
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
        controller: 'DashCtrl',
        cache: false,
            resolve: {
            "currentAuth": ["Auth",
                function (Auth) {
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
                                }],
            "dataLoad": function( $q, $timeout,$rootScope, Catalog, Major, $firebaseObject,Rooms ,$firebaseArray, Settings) {
                        var asynchData = $q.defer();
                            $timeout(function(){
                              asynchData.resolve({
                                        userData: function() {
                                                  return $rootScope.user;
                                        },
                                        catalog: function() {
                                                 return Catalog.all();
                                        },
                                        major: function() {
                                                return Major.all();
                                        },
                                        roomData: function() {
                                                  var courses = $rootScope.user.courses;
                                                  return Rooms.all(courses);
                                        },
                                        settings: function() {
                                           Settings.returnSettings();
                                        },
                                        userProfile: function(){
                                                var fbAuth= ref.getAuth();
                                            $rootScope.userProfile={};
                                                          if(fbAuth) {
                                                                  //set default userProfile
                                                                        var profiles = $firebaseObject(ref.child('profile'));
                                                                      profiles.$loaded().then(function(){

                                                                          $rootScope.defaultUser= profiles[0];
                                                                      })
                                                        var userReference = ref.child("profile/" + $rootScope.user.displayName);
                                                         var syncObjectAvatar= $firebaseObject(userReference.child("avatar"));
                                                        var syncObjectStatus= $firebaseObject(userReference);
                                                         $rootScope.userProfile = syncObjectStatus;

                                                    } else {
                                                        $state.go("login");
                                                    }
                                                                  return

                                        }

                                   });//end resolve
                            },500);
                            return asynchData.promise;
                          }
            }
  })

  .state('app.dashboard', {
    url: '/dashboard',
    views: {
            'menuContent': {
                templateUrl: 'templates/dashboard.html'
                            }
            }
  })
     .state('app.profile', {
        url: '/profile',
        views: {
                'menuContent': {
                    templateUrl: 'templates/profile.html',
                    controller: 'ProfileCtrl',
                            }
            }
  })
    .state('app.catalog', {
         cache: false,
        url: '/catalog',
        views: {
                'menuContent': {
                                templateUrl: 'templates/catalog.html',
                                controller: 'CatalogCtrl'
                                }
                }
  })
    .state('app.wish', {
        url: '/wish',
        views: {
                'menuContent': {
                                templateUrl: 'templates/wish.html',
                                controller: 'CatalogCtrl'
                                }
                }
  })
    .state('app.timetable', {
        url: '/timetable',
        views: {
                'menuContent': {
                                templateUrl: 'templates/timetable.html',
                                controller: 'TimetableCtrl'
                                }
            }
  })
    .state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                        templateUrl: 'templates/settings.html',
                        controller: 'SettingsCtrl'
                            }
                }
  })
    .state('app.rooms', {
        url: '/rooms',
        views: {
            'menuContent': {
                        templateUrl: 'templates/rooms.html',
                        controller: 'RoomsCtrl',
                            }
                }
  })
   .state('app.chat', {
        url: '/:roomId',
        views: {
            'menuContent': {
                        templateUrl: 'templates/chat.html',
                        controller: 'ChatCtrl'
                            }
                }
    })


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});
