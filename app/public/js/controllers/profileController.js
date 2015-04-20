function ProfileController() {

    // bind event listeners to button clicks //
    var that = this;

    // confirm account deletion //
    $('#profile-delete-btn').click(function () {
        $('.modal-confirm').modal('show');
    });

    // handle profile deletion //
    $('.modal-confirm .submit').click(function () {
        that.deleteProfile();
    });

    this.deleteProfile = function () {
        $('.modal-confirm').modal('hide');
        var that = this;
        $.ajax({
            url: '/delete-profile',
            type: 'POST',
            data: {id: $('#profileId').val()},
            success: function (data) {
                that.showLockedAlert('Your profile has been deleted.<br>Redirecting you back to the Profile Page.');
            },
            error: function (jqXHR) {
                console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
            }
        });
    }

    this.showLockedAlert = function(msg){
        $('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
        $('.modal-alert .modal-header h3').text('Success!');
        $('.modal-alert .modal-body p').html(msg);
        $('.modal-alert').modal('show');
        $('.modal-alert button').click(function(){
            window.location.href = '/profiles';
        })
        setTimeout(function(){
            window.location.href = '/profiles';
        }, 3000);
    }

}