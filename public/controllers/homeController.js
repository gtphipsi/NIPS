$(document).ready(function() {
    console.log("Loading home page...");

    $("#loginButton").off('click');
    $("#loginButton").click(function() {
        let lastName = document.getElementById('lastName').value;
        let badgeNumber = document.getElementById('badgeNumber').value;
        if (!lastName || !badgeNumber) {
            alert('Please fill out both fields');
        } else {
            
        }
    });
});