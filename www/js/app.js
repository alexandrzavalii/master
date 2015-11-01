// MyChat App - Ionic & Firebase Demo

var firebaseUrl = "https://aubg.firebaseIO.com/";
var ref = new Firebase(firebaseUrl);
function onDeviceReady() {
    angular.bootstrap(document, ["mychat"]);
}
//console.log("binding device ready");
// Registering onDeviceReady callback with deviceready event
document.addEventListener("deviceready", onDeviceReady, false);

// 'mychat.services' is found in services.js
// 'mychat.controllers' is found in controllers.js
var app = angular.module('mychat', ['ionic', 'firebase', 'angularMoment', 'mychat.controllers', 'mychat.services','angles','ngCordova'])

.run(function ($ionicPlatform, $rootScope, $location, Auth, $ionicLoading) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        // To Resolve Bug
        ionic.Platform.fullScreen();

        $rootScope.firebaseUrl = firebaseUrl;
        $rootScope.displayName = null;

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
    });
})

.config(function ($stateProvider, $urlRouterProvider) {
    console.log("setting config");
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // State to represent Login View
    .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return Auth.$waitForAuth();
        }]


        }
    })
    
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
        controller: 'DashCtrl',
            resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {

                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
      }],
"dataLoad": function( $q, $timeout,$rootScope, Catalog, Major ) {
    var asynchData = $q.defer();
        $timeout(function(){
          asynchData.resolve({
            userData: function() {
              return $rootScope.displayName;
            },
            catalog: function( ) {
              return Catalog.all();
            },
              major: function() {
                  return Major.all();
              }

          });
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
       controller: 'TimetableCtrl'
      }
    }
  })
        // setup an abstract state for the chat  directive
    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/chat/tabs.html",
        resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
      }]

        }
    })

    // Each tab has its own nav history stack:

    .state('tab.rooms', {
        url: '/rooms',
        views: {
            'tab-rooms': {
                templateUrl: 'templates/chat/tab-rooms.html',
                controller: 'RoomsCtrl',
                resolve: {

            "roomLoad": function( $q, $timeout,$rootScope, Rooms, $ionicLoading ) {

              var asynchData = $q.defer();
                    $ionicLoading.show({
                template: 'Loading...'
            });
              $timeout(function(){
               asynchData.resolve({
               roomData: function() {
                   var courses = $rootScope.displayName.courses;
              return Rooms.all(courses);
            }
          });
                      $ionicLoading.hide();
        },500);
        return asynchData.promise;
      }

                }
            }
        }
    })

    .state('tab.chat', {
        url: '/chat/:roomId',
        views: {
            'tab-chat': {
                templateUrl: 'templates/chat/tab-chat.html',
                controller: 'ChatCtrl'
            }
        }
    })


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});
