
$(document).ready(function() {
    console.log("Loading home page...");

    var userId = sessionStorage.getItem('userId');
    console.log(userId);

    var userURL = '/users/' + userId;
    var user;
    $.get(userURL, function(data) {
        user = data;
        console.log("retrieved user data");
        console.log(data);
    }).done(function() {
        $('#welcomeMessage').text(`Welcome, Brother ${user.lastName}`);
    });
});