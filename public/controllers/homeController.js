
$(document).ready(function() {
    console.log("Loading home page...");

    var userId = sessionStorage.getItem('userId');
    console.log(userId);
    if (!userId) {
        console.log("failed retrieving userId--returning to login page");
        window.location = '/';
    }

    var userURL = '/users/' + userId;
    var user;
    $.get(userURL, function(data) {
        user = data;
        console.log("retrieved user data");
        console.log(data);
    }).fail(function() {
        console.log("failed retrieving user data--returning to login page");
        window.location = '/';
    }).done(function() {
        $('#welcomeMessage').text(`Welcome, Brother ${user.lastName}`);
    });
});