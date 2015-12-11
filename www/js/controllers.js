angular.module('mychat.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
    //console.log('Login Controller Initialized');

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

                
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    var val = snapshot.val();
                                    
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.user = val;
                    });
                        console.log("EMAIL signin: " + $rootScope.user.email);

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

.controller('DashCtrl', function ($scope, $state,$timeout, $ionicSideMenuDelegate,Dash, dataLoad, $ionicPopover, $rootScope, $ionicModal) {
//dataload is resolve function for loading data before loading state
$scope.barClass=true; //class change
dataLoad.userProfile();
dataLoad.settings();

    var user = $scope.user;
    var catalog=dataLoad.catalog();
    var major=dataLoad.major();
    //toggle all course slide down menue
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
    //slide menue end


    $scope.credits=Dash.credits(user.coursesTaken,catalog); //count for the credits of the courses taken

    $scope.majors=major;




    $scope.coursesTaken=user.coursesTaken;
    var data = Dash.data($scope.credits);
    console.log("Credits: " + $scope.credits);

      $timeout(function(){
          var id="totalCredits";
          Dash.drawGraph(id,data);



        var MajorDoneObject= [];
          //discover major and count classes 
          var findMajorData=Dash.findMajorData(major,user.major);


          for(i=0;i<findMajorData.length;i++){
             var oneMajor=Dash.majorSelect(findMajorData[i],user.coursesTaken);
             MajorDoneObject.push(oneMajor);
          }

$scope.MajorDoneObject=MajorDoneObject;

          for(i=0;i<MajorDoneObject.length;i++){

          Dash.drawGraph(user.major[i], Dash.dataMajor(MajorDoneObject[i]));


          }
//popover overall
  $ionicPopover.fromTemplateUrl('templates/popoverStats.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popoverO = popover;
  });


//popover for major
  $ionicPopover.fromTemplateUrl('templates/popoverStatsMajors.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopoverMajor = function($event, major) {
        console.log(major);
        $scope.MajorDoneObject=MajorDoneObject;
        $scope.major = major;
        $scope.popover.show($event);
  };

     }, 500);

    $rootScope.showImage = function(image) {
            $scope.bigSrc=image.currentTarget;
         $ionicModal.fromTemplateUrl('templates/image-popover.html', {
         scope: $scope,
         animation: 'slide-in-up'
     }).then(function(modal) {
         $scope.modal = modal;
         $scope.modal.show();
     });
 }
 $rootScope.closeModal = function() {
         $scope.modal.hide();
 };


})
.controller('TimetableCtrl', function ($scope, $state, $ionicPopover) {

    var daycss=['item-positive',  'item-calm','item-balanced','item-energized','item-royal'];
    var length=$scope.user.courses.length;

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


.controller('ChatCtrl', function ($scope, Chats, $state, $ionicScrollDelegate, $ionicPopup, $ionicModal) {



    $ionicModal.fromTemplateUrl('templates/otheruserProfile.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

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

    $scope.$watch("chats.length",function handleFooChange( newValue, oldValue ) {
                        $ionicScrollDelegate.scrollBottom();
                    })

    $scope.sendMessage = function (msg) {
        Chats.send($scope.user, msg);
        $scope.IM.textMessage = "";

    }


    $scope.goback = function () {
     $state.go('app.rooms');
    }

     $scope.showConfirmRemove = function(message) {
   var confirmPopup = $ionicPopup.confirm({
     title: '<i class="icon ion-alert"></i> ',
     template: 'Are you sure you want to delete this message?'
   });
    confirmPopup.then(function(res) {
     if(res) {
       Chats.remove(message);

     } else {
       console.log('You are not sure');
     }
   });
     }

     $scope.viewProfile = function(msg) {
      if (msg.from === $scope.user.displayName) {
                    $state.go('app.profile');
      } else {
          $scope.otheruser=Chats.findUser(msg.from);
       $scope.modal.show();
      }
    };
})


.controller('RoomsCtrl', function ($scope, $state, dataLoad){
   $scope.rooms=dataLoad.roomData();


})
.controller('CatalogCtrl', function ($scope, Catalog, $state, $ionicLoading, $firebaseObject) {

    var fbAuth= ref.getAuth();
      if(fbAuth) {
                var userName = $scope.user;
                $scope.wishid=userName.wish;
                $scope.catalog = Catalog.all();
                var url=firebaseUrl+"/users/"+fbAuth.uid+"/wish";
                var urlUser = new Firebase(url);
        } else {
                    $state.go("login");
                    }



// edit this one;
$scope.clearSearch = function() { $scope.searchQuery = ''; }
    
    

$scope.addToWish=function(course,liked){
     var exists= false;
    console.log(course.id);
      var index = userName.wish.indexOf(course.id);  

     if (index > -1) { exists=true}else exists = false;
     
     if(liked==true && exists==false) {
         
            userName.wish.push(course.id); 
         console.log(urlUser);
            urlUser.set(userName.wish );

      } else if(liked==false && exists==true) {
          
          userName.wish.splice(index, 1); 
               urlUser.remove();

         urlUser.set(userName.wish );
      }
}
 
$scope.wishdelete=function(course){
 var index = userName.wish.indexOf(course.id);
 if (index > -1) {
     userName.wish.splice(index, 1); 
     urlUser.remove();
     urlUser.set(userName.wish );
}
                console.log(userName.wish);
}

    

$scope.filterwish = function(course) {
     return ($scope.wishid.indexOf(course.id) !== -1);
    };

})
.controller('ProfileCtrl', function($scope, $ionicHistory, $cordovaCamera, $firebaseObject, $rootScope, $ionicModal, $ionicPopover) {

    $ionicHistory.clearHistory();

    // gets the ID of a USER

     $scope.uploadAvatar = function() {
        var options = {
            quality : 75,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType : Camera.PictureSourceType.CAMERA,
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            targetWidth: 500,
            targetHeight: 500,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {
            var fbAuth= ref.getAuth();
var userReference = ref.child("profile/" + $rootScope.user.displayName);
          var syncObject= $firebaseObject(userReference.child("avatar"));
         $rootScope.userProfile.avatar = syncObject;
        syncObject.url=imageData;
         syncObject.$save().then(function(){
        console.log("Image uploaded");
         });
                }, function(error) {
            alert.error(error);
        });
    }

      var template = '<ion-popover-view class="changeStatus"><ion-header-bar><input type="text" placeholder={{innerHtml}} ng-maxlength="40" ng-model="status"  required /> <button class="button icon ion-checkmark" ng-click="editStatus(status,tag); status=null"  ng-disabled="status.length<=0 || status==undefined"></button></ion-header-bar> </ion-popover-view>';

  $scope.popover = $ionicPopover.fromTemplate(template, {
    scope: $scope
  });

     $scope.openPopover = function($event,$index) {
         $scope.innerHtml=$event.currentTarget.innerHTML;
         $scope.tag=$event.currentTarget.id;

    $scope.popover.show($event);
  };


$scope.editStatus=function(status,tag){
      var url=firebaseUrl+"/profile/"+$rootScope.user.displayName+"/"+tag;
    var urlUser = new Firebase(url);
    urlUser.set(status);
    $scope.userProfile.status=status;
        $scope.popover.hide();
}

})
.controller('SettingsCtrl', function($scope, Settings){

    $scope.changePass=function(oldPass,newPass){
      Settings.changePassword(oldPass,newPass);
    }


var profile =Settings.show();

    profile.$loaded().then(function() {
  $scope.profile=profile.$value;
  });

$scope.changeProfile=function(value){
    profile.$value=value;
    profile.$save();
}

   $scope.changeSetting=function(setting){
     Settings.update(setting);
   }

})

.controller('LeftMenuCtrl', function($scope, $location) {

    $scope.items=[
        {
        name: 'dashboard',
        url: '/app/dashboard',
        icon: 'icon ion-home'
    }, {
        name: 'timetable',
        url: '/app/timetable' ,
        icon: 'icon ion-calendar'
    },{
        name:'wish list',
        url: '/app/wish',
        icon: 'icon ion-ios7-lightbulb'
    },{
        name: 'catalog',
        url: '/app/catalog',
        icon:'icon ion-clipboard'
    },{
        name: 'settings',
        url: '/app/settings',
        icon: 'icon ion-gear-b'
    },{
            name: 'chat',
            url: '/app/rooms',
            icon: 'icon ion-chatbubble'
        }
    ]

  $scope.isItemActive = function(item) {
    return $location.path().indexOf(item.url) > -1;
}
})
.filter('nl2br', ['$filter',
  function($filter) {
    return function(data) {
      if (!data) return data;
      return data.replace(/\n\r?/g, '<br />');
    };
  }
])
.filter('filterCourse', function() {

  return function(arr1, coursesTaken) {


    return arr1.filter(function(val) {
      return true;
    })


  }
});
