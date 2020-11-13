var USER;
var USERS;
var USERS_BY_ID;
var TRANSACTIONS;
var TIMEFRAME;


$(document).ready(function() {
    console.log("Loading home page...");

    var userId = sessionStorage.getItem('userId');
    console.log(userId);
    if (!userId) {
        console.log("failed retrieving userId--returning to login page");
        window.location = '/';
    }

    $('#userLogTable').DataTable({
        searching: false,
        paging: false,
        info: false
    });

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
        $.get("/users", function(data) {
            USERS = data;
            console.log("retrieved user data");
        }).done(function() {
            USERS_BY_ID = createHashmapById(USERS);
            $.get("/transactions", function(data) {
                TRANSACTIONS = data;
                console.log("retrieved transaction data");
            }).fail(function() {
                console.log("failed retrieving transaction data--returning to login page");
                window.location = '/';
            }).done(function() {
                updateTimeframe();
                var pointsReceived = getUserReceiverTransactions(userId, TRANSACTIONS);
                $('#userLogTable').DataTable().clear().draw();
                for (var i = 0; i < pointsReceived.length; i++) {
                    var transaction = pointsReceived[i];
                    var dateEarned = transaction.dateEarned.toString().substring(0, 10);
                    var newRow = [dateEarned, transaction.reason, transaction.amount];
                    $('#userLogTable').DataTable().row.add(newRow);
                }
                $('#userLogTable').DataTable().draw();                            
            });
        });
    });
});

function updateTimeframe() {
    var time = $('#rankTimeframe').val();
    if (time == "weekly") {
        TIMEFRAME = timeframes.WEEKLY;
    } else if (time == "monthly") {
        TIMEFRAME = timeframes.MONTHLY;
    } else {
        TIMEFRAME = timeframes.SEMESTERLY;
    }
    updateRank();
}

function updateRank() {
    var leaderboard = getLeaderboard(TRANSACTIONS, TIMEFRAME);
    var userRanking = getUserRanking(USER._id, leaderboard);
    $('#userRank').text('Rank: ' +  userRanking);
    addRankIcon(userRanking);
    $('#pointsBehind').text(getPointsBehindMessage(userRanking, leaderboard));
    updateStatistics(leaderboard);
}

function updateStatistics(leaderboard) {
    var mean = getMean(leaderboard);
    var median = getMedian(leaderboard);
    var low = getLow(leaderboard);
    var high = getHigh(leaderboard);
    $('#statMean').text(Math.floor(parseFloat(mean)));
    $('#statMedian').text(median);
    $('#statLow').text(low);
    $('#statHigh').text(high);
}

function addRankIcon(ranking) {
    $('#rankIcon').html('');
    if (ranking == 1) {
        $('#rankIcon').append('<i class="fas fa-chess-king"></i>')
    } else if (ranking <= 2) {
        $('#rankIcon').append('<i class="fas fa-chess-queen"></i>');
    } else if (ranking <= 5) {
        $('#rankIcon').append('<i class="fas fa-chess-knight"></i>');
    } else if (ranking <= 7) {
        $('#rankIcon').append('<i class="fas fa-chess-rook"></i>');
    } else if (ranking <= 10) {
        $('#rankIcon').append('<i class="fas fa-chess-bishop"></i>');
    } else {
        $('#rankIcon').append('<i class="fas fa-chess-pawn"></i>');
    }
}

function getPointsBehindMessage(userRanking, leaderboard) {
    var userAhead = {};
    var userPoints = leaderboard[userRanking - 1].points;
    if (userRanking > 1) {
        var userAheadId = leaderboard[userRanking - 2].id;
        var pointsBehind = leaderboard[userRanking - 2].points - userPoints;
        userAhead = USERS_BY_ID[userAheadId];
        if (pointsBehind == 1) {
            return "You are 1 point behind " + getName(userAhead);    
        }
        return "You are " + pointsBehind + " points behind " + getName(userAhead);
    } else {
        var pointsBehind = Math.floor(Math.random() * 4200) + 690;
        return "You are " + pointsBehind + " points behind Wysong";
    }
}
