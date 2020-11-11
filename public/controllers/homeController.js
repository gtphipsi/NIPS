var USER;
var TRANSACTIONS;


$(document).ready(function() {
    console.log("Loading home page...");

    var userId = sessionStorage.getItem('userId');
    console.log(userId);
    if (!userId) {
        console.log("failed retrieving userId--returning to login page");
        window.location = '/';
    }

    var userURL = '/users/' + userId;
    $.get(userURL, function(data) {
        USER = data;
        console.log("retrieved user data");
        console.log(data);
    }).fail(function() {
        console.log("failed retrieving user data--returning to login page");
        window.location = '/';
    }).done(function() {
        $('#welcomeMessage').text(`Welcome, Brother ${USER.lastName}`);
    });

    $.get("/transactions", function(data) {
        TRANSACTIONS = data;
        console.log("retrieved transaction data");
    }).fail(function() {
        console.log("failed retrieving transaction data--returning to login page");
        window.location = '/';
    }).done(function() {
        var leaderboard = getLeaderboard(TRANSACTIONS, timeframes.WEEKLY);
        console.log(leaderboard);
        var userRanking = getUserRanking(userId, leaderboard);
        $('#userRank').text(userRanking);
    });
});