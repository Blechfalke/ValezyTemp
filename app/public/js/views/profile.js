$(document).ready(function() {

    var hc = new ProfileController();

    // customize the account settings form //
    $('#edit-profile-form h1').text('Edit Profile');
    $('#edit-profile-form #sub1').text('Here you can edit the Profiles for your account.');

    $('#add-profile-form h1').text('Add Profile');
    $('#add-profile-form #sub1').text('Here you can add the Profiles for your account.');

    $('#profile-form h1').text('My Profiles');
    $('#profile-form #sub1').text('Here you can see the Profiles for your account.');

    $('#user-tf').attr('disabled', 'disabled');
    $('#profile-delete-btn').html('Delete');
    $('#profile-delete-btn').addClass('btn-danger');

    // setup the confirm window that displays when the user chooses to delete their account //
    $('.modal-confirm').modal({ show : false, keyboard : true, backdrop : true });
    $('.modal-confirm .modal-header h3').text('Delete Profile');
    $('.modal-confirm .modal-body p').html('Are you sure you want to delete your profile?');
    $('.modal-confirm .cancel').html('Cancel');
    $('.modal-confirm .submit').html('Delete');
    $('.modal-confirm .submit').addClass('btn-danger');

})