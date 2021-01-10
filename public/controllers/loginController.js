
$(document).ready(function() {
    console.log("Loading login page...");

    $("#loginButton").off('click');
    $("#loginButton").click(function() {
        let lastName = document.getElementById('lastName').value;
        let badgeNumber = document.getElementById('badgeNumber').value;
        var userInfo = {
            lastName: lastName,
            badgeNumber: badgeNumber
        }
        if (!lastName || !badgeNumber) {
            alert('Please fill out both fields');
        } else {
            console.log("POST request TBD");
            $.post("/login", userInfo).done(function(data) {
                console.log("Received data:");
                console.log(data);
                sessionStorage.setItem('userId', data._id);
                window.location = "/home";
            }).fail(function() {
                alert("Incorrect Password or Username");
            });
        }
    });
});