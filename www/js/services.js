angular.module('mychat.services', ['firebase'])
    .factory("Auth", ["$firebaseAuth", "$rootScope",
    function ($firebaseAuth, $rootScope) {
            var ref = new Firebase(firebaseUrl);
            return $firebaseAuth(ref);
}])


/**
 * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
 */

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
     dataMajor:function(total,done){
         
    return [
      {
        value: done,
        color:"#F7464A",
        highlight: "#FF5A5E"
      },
      {
        value: total,
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
     majorSelect: function(required,elective,taken){

         var list=[];
         var all= required.concat(elective)
        for(p=0;p<taken.length;p++)
                     for(j=0;j<all.length;j++) 
                            if(taken[p].id == all[j]) {
                                console.log(taken[p].id);
                                list.push(taken[p].id);

                        
                                                      }
         return list;
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
     var userReference = ref.child("users/" + fbAuth.uid+"/settings");

    var urlProfile=firebaseUrl+"/profile/";
    var settingsArray = $firebaseArray(userReference);
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
                   userReference.update(changedSetting);
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
