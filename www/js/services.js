angular.module('mychat.services', ['firebase'])
    .factory("Auth", ["$firebaseAuth", "$rootScope",
    function ($firebaseAuth, $rootScope) {
            var ref = new Firebase(firebaseUrl);
            return $firebaseAuth(ref);
}])

.factory('Chats', function ($firebase, Rooms) {

    var selectedRoomId;
    var ref = new Firebase(firebaseUrl);
    var chats;

    
    return {
        all: function () {
            return chats;
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
                chats = $firebase(ref.child('rooms').child(selectedRoomId).child('chats')).$asArray();
            }
        },
        send: function (from, message) {
            console.log("sending message from :" + from.displayName + " & message is " + message);
            if (from && message) {
                var chatMessage = {
                    from: from.displayName,
                    message: message,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                };
                chats.$add(chatMessage).then(function (data) {
                    console.log("message added");
                });
            }
        }
    }
})

/**
 * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
 */

.factory('Catalog', function ($firebase) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase(firebaseUrl);
 var catalog = $firebase(ref.child('catalog')).$asArray();
 
    return {
        all: function () {
            return catalog;
        }
    }
})

.factory('Dash', function ($firebase) {
 
 return {
    data:function(credits) {
        
        return [
      {
        value: credits,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Achieved"
      },
      {
        value: 120,
        color: "#FDB45C",
        highlight: "#FFC870",
        label: "Total"
      }
    ]
                    },
     dataMajor:function(total,done){
         
    return [
      {
        value: done,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Achieved"
      },
      {
        value: total,
        color: "#FDB45C",
        highlight: "#FFC870",
        label: "Total"
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
     majorCount: function(required,elective,taken){
         var count=0;
         var all= required.concat(elective)
        for(p=0;p<taken.length;p++)
                     for(j=0;j<all.length;j++) 
                            if(taken[p].id == all[j]) {
                                console.log(taken[p].id);
                        count++;
                        
                                                      }
         return count;
     }
}})



.factory('Major', function ($firebase) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase(firebaseUrl);
 var major = $firebase(ref.child('majors')).$asArray();
 
    return {
        all: function () {
            return major;
        }
    }
})
.factory('Rooms', function ($firebase) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase(firebaseUrl);
    var rooms = $firebase(ref.child('rooms')).$asArray();

    return {
        all: function (courses) {
            var selectRooms=[];
                for(i=0;i<courses.length;i++)
            for(j=0; j<rooms.length;j++)
                if( courses[i].id== rooms[j].name){
                    console.log("FOUND "+ courses[i].id);
                   selectRooms.push(rooms[j]);
                 break;   
                }
            return selectRooms;
        },
        get: function (roomId) {
            // Simple index lookup
            return rooms.$getRecord(roomId);
        }
    }
});
