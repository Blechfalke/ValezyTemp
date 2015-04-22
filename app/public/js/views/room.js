$(function () {
    console.log('room.html - Starting Script !!');

    var host = 'http://localhost:8080';
    var messages = io.connect(host + '/messages');
    var roomNum = '#{room_number}';
    var userName = '#{user.user}';

messages.on('connect', function () {

    console.log('room.html - Connection Established !!');

    //create new event handled in socket.js
    messages.emit('joinroom', {room: roomNum, user: userName})

})

//listen for key up on inputfield message
$(document).on('keyup', '.newmessage', function (e) {

    //keycode 13 = enter key and input not empty
    if (e.which === 13 && $(this).val() != '') {

        //send data broadcasted over socket connection (show to other users)
        messages.emit('newMessage', {
            room_number: roomNum,
            user: userName,
            message: $(this).val()
        })

        //update my view
        updateMessageFeed($(this).val());

        //empty message input filed
        $(this).val('');
    }
})

//listen to messagefeed event from socket.js
messages.on('messagefeed', function (data) {

    //convert from JSON to array
    var msgs = JSON.parse(data);

    //update view
    updateMessageFeed(msgs.message);

})

//update view of messages
function updateMessageFeed(message) {

    //generate template
    var str = '<li>';
    str += '<div class="msgbox">';
    str += '<div class="msg"><p>' + message + '</p></div>';
    str += '</div>';
    str += '</li>';

    $(str).hide().prependTo($('.messages')).slideDown(100);
}

//update uisers list
messages.on('updateUsersList', function (data) {

    //convert JSON to array
    var userlist = JSON.parse(data);

    //empty the list to render all again in the next for loop
    $('.users').html('');

    //for loop to fill the list
    for (var n = 0; n < userlist.length; n++) {

        //generate li item
        var str = '<li><h5>' + userlist[n].user + '</h5></li>';

        //add to list
        $(str).prependTo($('.users'));
    }
})

//create event updateList to handle in socket.js
setInterval(function () {

    //send event to update list of room every 15 seconds
    messages.emit('updateList', {room: roomNum});
}, 15 * 1000);

})