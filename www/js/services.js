angular.module('mychat.services', ['firebase'])
    .factory("Auth", ["$firebaseAuth", "$rootScope",
    function ($firebaseAuth, $rootScope) {
            var ref = new Firebase(firebaseUrl);
            return $firebaseAuth(ref);
}])


.factory('Catalog', function ($firebaseArray) {
    // Might use a resource here that returns a JSON array
 var catalog = $firebaseArray(ref.child('catalog'));
 
    return {
        all: function () {
            return catalog;
        }
    }
})

.factory('Dash', function ($firebaseArray) {
 
 return {
    data:function(credits) {
        
        return [
      {
        value: credits,
        color:"#1f2d79",
        highlight: "#FF5A5E"
      },
      {
        value: 120,
        color: "#acb263",
        highlight: "#FFC870"
      }
    ]
                    },
     dataMajor:function(major){
         
    return [
      {
        value: major.Done.length,
        color:"#F7464A",
        highlight: "#FF5A5E"
      },
      {
        value: major.Required,
        color: "#FDB45C",
        highlight: "#FFC870"

      }
    ]},
     
     credits:function(courses,catalog){
         var credits=0;
              for(i=0;i<courses.length;i++) 
                 for(j=0;j<catalog.length;j++)
                     if(courses[i].id==catalog[j].id){
                         credits+= parseInt(catalog[j].credits) 
                         break;
                     }
         return credits;
     },
     majorSelect: function(major,taken){

         var list=[];
          var totalRequired=major.required.length + parseInt(major.elective.number);
         var listRequired=[];
         var listElective=[];
         var elective=major.elective.courses;
        var ElectiveLeftNumber=parseInt(major.elective.number);
         var ElectiveLeft=elective;
                for(p=0;p<taken.length;p++)
                     for(j=0;j<elective.length;j++)
                            if(taken[p].id == elective[j]) {
                                listElective.push(taken[p].id);
                                ElectiveLeftNumber--;
                                ElectiveLeft.splice( taken[p].id, 1 );
                                break;
                            }
         var RequiredLeft=major.required;


         for(p=0;p<taken.length;p++)
                     for(j=0;j<major.required.length;j++)
                            if(taken[p].id == major.required[j]) {

                                RequiredLeft.splice( taken[p].id, 1 );
                                listRequired.push(taken[p].id);
                                break;
                            }
         console.log("Required:"+RequiredLeft);

                     list=listRequired.concat(listElective);
        var oneMajor = {Major: major.id, Done: list, Required: totalRequired, RequiredLeft: RequiredLeft, ElectiveLeftNumber: ElectiveLeftNumber, ElectiveLeft: ElectiveLeft};

         return oneMajor;
     },
     findMajorData: function(majorCatalog,majorUser){
         var majorData=[];
           for(i=0;i<majorCatalog.length;i++)
              for(j=0;j<majorUser.length;j++)
                  if(majorUser[j]==majorCatalog[i].id)
                  {
                      majorData.push(majorCatalog[i]);
                  }

         return majorData;
     },
     drawGraph: function(id,data){

             var totalCredits = document.getElementById(id).getContext("2d");
            var totalPie = new Chart(totalCredits).Pie(data,{
                animateScale: true,
                showTooltips: false
            });
     }
}})



.factory('Major', function ($firebaseArray) {
    // Might use a resource here that returns a JSON array

 var major = $firebaseArray(ref.child('majors'));
 
    return {
        all: function () {
            return major;
        }
    }
})
.factory('Settings', function($firebaseArray, $rootScope, $firebaseObject){

      var fbAuth= ref.getAuth();
     var urlUser = ref.child("users/" + fbAuth.uid+"/settings");
    var urlProfile=firebaseUrl+"/profile/";
    var settingsArray = $firebaseArray(urlUser);
  var check=false;
    return {
        returnSettings: function(){

                          $rootScope.user.settings = settingsArray;                        //to check settings Profile
                        settingsArray.$loaded(function(){
                            for(var i=0; i<settingsArray.length; i++){
                             var urlNew=urlProfile+$rootScope.user.displayName+"/"+settingsArray[i].$id;
                                var urlUser = new Firebase(urlNew);
                            if(settingsArray[i].$value==true){
                                            check=true;
                                urlUser.set($rootScope.user[settingsArray[i].$id]);
                                            } else{
                                    urlUser.set(null);
                                            }
                                                                     }
                            return check;

                             })

        },
        update: function(setting){
                   var changedSetting={};
                   changedSetting[setting.$id]=setting.$value;
                   urlUser.update(changedSetting);
                        var urlNew=urlProfile+$rootScope.user.displayName+"/"+setting.$id;
                         var urlUser = new Firebase(urlNew);
                   if(setting){
                    urlUser.set($rootScope.user[setting.$id]);

                   }else {
                            urlUser.set(null);
                   }

        },
        show: function(){
            return $firebaseObject(ref.child('profile').child($rootScope.user.displayName).child('show'));

        },
        changePassword: function(oldPass,newPass){
            ref.changePassword({
                email: $rootScope.user.email,
              oldPassword: oldPass,
              newPassword: newPass
            }, function(error) {
              if (error) {
                switch (error.code) {
                  case "INVALID_PASSWORD":
                    alert("The specified user account password is incorrect.");
                    break;
                  case "INVALID_USER":
                    alert("The specified user account does not exist.");
                    break;
                  default:
                    alert("Error changing password:", error);
                }
              } else {
                alert("User password changed successfully!");
                      }
                    });
                            }
    }
})
.factory('Chats', function ( Rooms, $firebaseArray, $timeout, $rootScope, $firebaseObject) {

    var selectedRoomId;
    var chats;
    var profiles;

    return {
        all: function () {
           $timeout(function(){
            profiles.$loaded().then(function() {
                for (var i = 0; i < chats.length; i++)
                    for (var j = 0; j < profiles.length; j++){
                        if(chats[i].from==profiles[j].$id){
                        chats[i].avatar=profiles[j].avatar;
                        }

                    }
                })

            })
            return chats;
        },

        findUser: function(username){
            var profileFound = $firebaseObject(ref.child('profile').child(username));
            return profileFound;
        },
        remove: function (chat) {
            chats.$remove(chat).then(function (ref) {
                ref.key() === chat.$id; // true item has been removed
            });
        },
        get: function (chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        },
        getSelectedRoomName: function () {
            var selectedRoom;
            if (selectedRoomId && selectedRoomId != null) {
                selectedRoom = Rooms.get(selectedRoomId);
                if (selectedRoom)
                    return selectedRoom.name;
                else
                    return null;
            } else
                return null;
        },
        selectRoom: function (roomId) {
            console.log("selecting the room with id: " + roomId);
            selectedRoomId = roomId;

            if (!isNaN(roomId)) {
                profiles = $firebaseArray(ref.child('profile'));
                chats = $firebaseArray(ref.child('rooms').child(selectedRoomId).child('chats'));

            }
        },
        send: function (from, message) {

            console.log("sending message from :" + from.displayName + " & message is " + message);
            if (from && message) {
                var chatMessage = {
                    from: from.displayName,
                    message: message,
                    avatar: $rootScope.userProfile.avatar,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                };
                chats.$add(chatMessage).then(function (data) {

                    console.log("message added");
                });
            }
        }
    }
})

.factory('Rooms', function ($firebaseArray) {
    // Might use a resource here that returns a JSON array
    var rooms = $firebaseArray(ref.child('rooms'));

    return {
        all: function (courses) {
            var selectRooms=[];
            rooms.$loaded().then(function() {
                for(i=0;i<courses.length;i++)
            for(j=0; j<rooms.length;j++)
                if( courses[i].id== rooms[j].name){
                    console.log("FOUND "+ courses[i].id);
                   selectRooms.push(rooms[j]);
                 break;   
                }
                        })
            return selectRooms;
        },
        get: function (roomId) {
            // Simple index lookup
            return rooms.$getRecord(roomId);
        }
    }
});
