module.exports = function(io, rooms){

	//handel room list
	var chatrooms = io.of('/roomlist').on('connection', function(socket){

		console.log('socket.js - Connection established on the Server!');

		//update view when refreshing the page
		socket.emit('roomupdate', JSON.stringify(rooms));

		//get the event for a new room
		socket.on('newroom', function(data){ //data = the date we send as an event in chatrtooms.html

			rooms.push(data);

			//update view (to all others excpet for user that created the room)
			socket.broadcast.emit('roomupdate', JSON.stringify(rooms));

			//update view for current user that dreated the room
			socket.emit('roomupdate', JSON.stringify(rooms));

		})//end new room

	})//end handlöe chatroom

	//handle messages
	var messages = io.of('/messages').on('connection', function(socket){

		console.log('socket.js - Connected to the Chatroom!')

		//join room event handling
		socket.on('joinroom', function(data){

			//create socket variables
			socket.username = data.user;

			//allow this user to join this partition and comunicate 
			//with otehr user on the same partition
			socket.join(data.room);

			//update userList of room
			updateUserList(data.room, true);

		})//end join room

		//handle new messages (when user presses enter)
		socket.on('newMessage', function(data){

			//send message data to all members in the room (except active user).
			//this data will only be recived by users in the same partition (joinroom)
			socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));

		})//end new message

		function updateUserList(room, updateAll){

			//get all users in a partition (room) -> data is given from socket avriables (joinroom)
			var getUsers = io.of('/messages').clients(room);
			var userlist = [];

			//loop through all active users in partition
			for(var i in getUsers){

				//populate list with active users (name and pics from socket variables)
				userlist.push({user : getUsers[i].username});

			}

			//send event to rooms.html to update active users list
			socket.to(room).emit('updateUsersList', JSON.stringify(userlist));

			//if update all, broadcast to all users to update their userlist
			if(updateAll){

				socket.broadcast.to(room).emit('updateUserList', JSON.stringify(userlist));

			}

		}//end updateUserList

		//handle update list event
		socket.on('updateList', function(data){

			updateUserList(data.room);

		})//end updateList

	})//end handle messages

}//end program