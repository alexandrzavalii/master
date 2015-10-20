angular.module('mychat.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
    //console.log('Login Controller Initialized');

    var ref = new Firebase($scope.firebaseUrl);
    var auth = $firebaseAuth(ref);

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.createUser = function (user) {
        console.log("Create User Function called");
        if (user && user.email && user.password && user.displayname) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });

            auth.$createUser({
                email: user.email,
                password: user.password
            }).then(function (userData) {
                alert("User created successfully!");
                ref.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }).catch(function (error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signIn = function (user) {

        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.$authWithPassword({
                email: user.email,
                password: user.pwdForLogin
            }).then(function (authData) { 
                console.log("Logged in as:" + authData.uid);
             window.localStorage['UserUid'] = authData.uid;
                
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    var val = snapshot.val();
                                    
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.displayName = val;
                    });
                        console.log("EMAIL signin: " + $rootScope.displayName.email);

                });
                $ionicLoading.hide();
                $state.go('app.dashboard');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
})

.controller('TimetableCtrl', function ($scope, $state, $ionicPopover) {
        var userName = $scope.displayName;
    

    $scope.courses = userName.courses;
    var daycss=['item-positive',  'item-calm','item-balanced','item-energized','item-royal'];
    var length=$scope.courses.length;
  
    $scope.cssfunction = function(course)
    {
        return daycss[Math.round(Math.random() * daycss.length-1)];
    }
    
$scope.timeFilter = function(item){ 
    if((item.schedule[0]==$scope.date) || (item.schedule[1]==$scope.date)) return true;
    return false;
};
      $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
    $scope.date = 'Monday';

    $scope.week =[ 'Monday', 'Tuesday','Wednesday','Thursday','Friday'];
    
    $scope.weekday=function(item){
     $scope.date=item;
    }
        $scope.filterday = function() {
        return ($scope.wishid.indexOf(course.id) !== -1);
    };
    


})
.controller('DashCtrl', function ($scope, $state,$timeout, $ionicSideMenuDelegate,Catalog,Major,Dash ) {
      
      $timeout(function(){
    var userName = $scope.displayName;
    $scope.userName =userName.displayName;
    $scope.coursesTaken=userName.coursesTaken;
        var coursesTaken=userName.coursesTaken;
        var catalog=Catalog.all();
        var major=Major.all();
          var count=0;
          
     $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
          

$scope.majors=userName.major; //all majors of the user
$scope.credits=Dash.credits(coursesTaken,catalog); //count for the credits of the courses taken
     
var data = Dash.data($scope.credits); 
var totalCredits = document.getElementById("totalCredits").getContext("2d");
var totalPie = new Chart(totalCredits).Pie(data);
          
          //discover major and count classes 
          for(i=0;i<major.length;i++){
              for(j=0;j<userName.major.length;j++)
            if(userName.major[j]==major[i].id) {
                

var majorDone=Dash.majorCount(major[i].required,major[i].elective.courses,coursesTaken);
var totalRequired=major[i].required.length+ parseInt(major[i].elective.number);
console.log("TOTAL: "+ totalRequired + " DONE: " + majorDone+ " MAJOR: " +major[i].id);
var datas= Dash.dataMajor(totalRequired,majorDone);
             
var majorCredits = document.getElementById(userName.major[i]).getContext("2d");
var majorPie = new Chart(majorCredits).Pie(datas);  

                count=0;  
            }
          }

     }, 500); 

    $scope.ChatRoom = function(user){
    $state.go('tab.rooms');
    }
      $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
 
        $scope.gotoNav = function() {
      $state.go('app.dashboard');  
    };
       $scope.gotoTimetable = function() {
      $state.go('timetable');  
    };
})
.controller('ChatCtrl', function ($scope, Chats, $state) {
    //console.log("Chat Controller initialized");

    $scope.IM = {
        textMessage: ""
    };

    Chats.selectRoom($state.params.roomId);

    var roomName = Chats.getSelectedRoomName();

    // Fetching Chat Records only if a Room is Selected
    if (roomName) {
        $scope.roomName = " - " + roomName;
        $scope.chats = Chats.all();
    }

    $scope.sendMessage = function (msg) {
        console.log(msg);
        Chats.send($scope.displayName, msg);
        $scope.IM.textMessage = "";
    }

    $scope.remove = function (chat) {
        Chats.remove(chat);
    }
    $scope.goback = function () {
     $state.go('tab.rooms');   
    }
})

.controller('RoomsCtrl', function ($scope, Rooms, Chats, $state, $timeout) {
var courses=$scope.displayName.courses;

      $timeout(function(){
    $scope.rooms = Rooms.all(courses);

      },500 );
    
    $scope.openChatRoom = function (roomId) {
        $state.go('tab.chat', {
            roomId: roomId
        });
    }
    $scope.goback = function(){
        $state.go('app.dashboard');
    }
})
.controller('CatalogCtrl', function ($scope, Catalog, $state, $firebase, $ionicLoading) {

          var userName = $scope.displayName;
    $scope.catalog = Catalog.all();
var UserUid= window.localStorage['UserUid'];
var url="https://aubg.firebaseio.com/users/"+UserUid+"/wish";
    $scope.wishid=userName.wish;
    var urlUser = new Firebase(url);
// Modify the 'first' and 'last' children, but leave other data at fredNameRef unchanged

    
$scope.clearSearch = function() { $scope.searchQuery = ''; }
    
    
$scope.wishlistfunction=function(course,liked){
     var exists= false;
      var index = userName.wish.indexOf(course.id);  
     if (index > -1) { exists=true}else exists = false;
     
     if(liked==true && exists==false) {
         
            userName.wish.push(course.id); 
          urlUser.update(userName.wish);    
      } else if(liked==false && exists==true) {
          
          userName.wish.splice(index, 1); 
               urlUser.remove();
           urlUser.update(userName.wish);
      }
}
 
$scope.wishdelete=function(course){
                      var index = userName.wish.indexOf(course.id);  
                         if (index > -1) {
     userName.wish.splice(index, 1); 
     urlUser.remove();
     urlUser.update(userName.wish);
                                         }
                console.log(userName.wish);
}

    

$scope.filterwish = function(course) {
     return ($scope.wishid.indexOf(course.id) !== -1);
    };

})

