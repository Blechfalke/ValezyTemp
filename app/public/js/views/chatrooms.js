$(function(){

    console.log('chatrooms.html - Starting Script !');

    var host = 'http://localhost:8080';

    //establishing socket.io connection (unique namespace)
    var socket = io.connect(host + '/roomlist'); // ex: http://localhost:3000/roomlist

    //listen to connect event
    socket.on('connect', function(){
        console.log('chatrooms.html - Connection Established !');
    })

    //listen to roomupdate event
    socket.on('roomupdate', function(data){

        //convert JSON back to array
        var procData = JSON.parse(data);

        //empty the list to render all again in the next for loop
        $('#roomlist').html('');

        //for loop to fill the list
        for(var i = 0; i < procData.length; i++){

            //generate li item
            var str = '<a href="room/' + procData[i].room_number + '"><li>' + procData[i].room_name + '</li></a>';

            //add to list
            $('#roomlist').prepend(str);
        }
    })


    //create new room
    $(document).on('click', '#create', function(){

        //fetch text of input filed "newRoom"
        var room_name = $('#newRoom').val();
        if(room_name!=''){

            //generate new room number
            var room_number = parseInt(Math.random() * 10000);

            //create a new event (send to socket.js)
            socket.emit('newroom', {room_name:room_name, room_number:room_number});

            //clear input field
            $('#newRoom').val('');
        }
    })

})
