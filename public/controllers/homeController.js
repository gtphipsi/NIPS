var USER;
var USERS;
var COMMITTEES;
var USERS_BY_ID;
var TRANSACTIONS;
var REQUESTS;
var OUTSTANDING_REQUESTS = [];
var TIMEFRAME;


$(document).ready(function() {
    console.log("Loading home page...");

    

    $('#signoutButton').off('click');
    $('#signoutButton').click(function() {
        sessionStorage.setItem('userId', '');
        location.href = '/login';
    });

    $('#reportIssueButton').off('click');
    $('#reportIssueButton').click(function() {
        location.href ="https://github.com/gtphipsi/NIPS/issues/new?title=YOUR%20ISSUE&body=DESCRIPTION";
    });

    addFooter();

    var userId = sessionStorage.getItem('userId');
    console.log(userId);
    checkLoggedIn(userId);
    createNavBar('home');

    $('#userLogTable').DataTable({
        searching: false,
        paging: false,
        info: false
    });

    $('#userRequestsTable').DataTable({
        searching: false,
        paging: false,
        info: false
    });

    var userURL = '/users/' + userId;
    $.get(userURL, function(data) {
        USER = data;
        console.log("retrieved one user data");
        console.log(data);
    }).fail(function() {
        alert("failed retrieving user data--returning to login page");
        window.location = '/';
    }).done(function() {
        $('#welcomeMessage').text(`Welcome, Brother ${USER.lastName} `);
        $('#welcomeMessage').append(getRandomUserIcon());
        $.get("/users", function(data) {
            USERS = data;
            console.log("retrieved all user data");
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
                $.get("/requests", function(data) {
                    REQUESTS = data;
                    console.log("retrieved requests data");
                }).fail(function() {
                    console.log("failed retrieving requests data--returning to login page");
                    window.location = '/';
                }).done(function() {
                    $.get('/committees', function(data) {
                        COMMITTEES = data;
                        console.log("retrieved committee data");
                    }).done(function() {
                        OUTSTANDING_REQUESTS = getRequestsForUser(USER, REQUESTS, COMMITTEES);
                        console.log(OUTSTANDING_REQUESTS);
                        for (var r = 0; r < OUTSTANDING_REQUESTS.length; r++) {
                            var request = OUTSTANDING_REQUESTS[r];
                            var date = request.date.toString().substring(0, 10);
                            var reason = request.reason;
                            var requester = getName(USERS_BY_ID[request.requesterId]);
                            var assigner = request.assigner;
                            var newRow = [date, reason, requester, assigner];
                            $('#userRequestsTable').DataTable().row.add(newRow);
                        }
                        $('#userRequestsTable').DataTable().draw();
                        $("#loadingIcon").hide();
                    });
                });
            });
        });
    });

    var requestDialog = $("#requestDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 200,
        position: {
            my: "center",
            at: "center",
            of: window
        }
    });

    $('#requestButton').off('click');
    $('#requestButton').click(function() {
        requestDialog.dialog('open');
    });

    $('#requestSubmit').off('click');
    $('#requestSubmit').click(function() {
        var reason = $('#requestReason').val();
        var assigner = $('#requestAssigner').val();
        var date = $('#requestDate').val();
        if (confirm('Submit request to ' + assigner + ' for ' + reason + ' on ' + date + '?')) {
            var newRequest = {
                requesterId: USER._id,
                assigner: assigner,
                reason: reason,
                date: new Date(date)
            }
            $.post("/requests", newRequest).done(function() {
                console.log("Request successfully added");
                console.log(newRequest);
                alert('Request submitted');
            });
        } else {
            alert('Request not submitted');
        }
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
    var userPoints;
    if (userRanking == 0) {
        userPoints = 0;
    } else {
        userPoints = leaderboard[userRanking - 1].points;
    }
    $('#userRank').text('Rank: ' +  userRanking + ' | Points: ' + userPoints);
    addRankIcon(userRanking);
    $('#pointsBehind').text(getPointsBehindMessage(userRanking, leaderboard));
    updateStatistics(leaderboard);
    updateProgressBar(userPoints);
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
    if (ranking < 1) {
        $('#rankIcon').append('<i class="fas fa-chess pkpgreen"></i>');
        $('#pointsBehind').html('');
    } else if (ranking == 1) {
        $('#rankIcon').append('<i class="fas fa-chess-king pkpgreen"></i>');
    } else if (ranking <= 2) {
        $('#rankIcon').append('<i class="fas fa-chess-queen pkpgreen"></i>');
    } else if (ranking <= 5) {
        $('#rankIcon').append('<i class="fas fa-chess-knight pkpgreen"></i>');
    } else if (ranking <= 7) {
        $('#rankIcon').append('<i class="fas fa-chess-rook pkpgreen"></i>');
    } else if (ranking <= 10) {
        $('#rankIcon').append('<i class="fas fa-chess-bishop pkpgreen"></i>');
    } else {
        $('#rankIcon').append('<i class="fas fa-chess-pawn pkpgreen"></i>');
    }
}

function getPointsBehindMessage(userRanking, leaderboard) {
    if (!userRanking || !leaderboard) {
        return;
    }
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
    } else if (userRanking == 1) {
        var pointsBehind = Math.floor(Math.random() * 4200) + 690;
        return "You are " + pointsBehind + " points behind Wysong";
    } else {
        $('#pointsBehind').html('');
    }
}

function updateProgressBar(userPoints) {
    var recommendedPoints;
    if (TIMEFRAME == timeframes.WEEKLY) {
        recommendedPoints = recommended.WEEK;
    } else if (TIMEFRAME == timeframes.MONTHLY) {
        recommendedPoints = recommended.MONTH;
    } else if (TIMEFRAME == timeframes.SEMESTERLY) {
        recommendedPoints = recommended.SEMESTER;
    }
    var progress;
    if (userPoints == 0) {
        progress = 1;
        // $('#progressBar').text('');
    } else if (userPoints >= recommendedPoints) {
        progress = 100;
    } else {
        progress = Math.floor(100 * userPoints / recommendedPoints);
    }
    var percentage = progress + '%';
    $('#userProgress').width(percentage);
    $('#progressIcon').hide();
}

function getRandomUserIcon() {
    var random = Math.floor(Math.random() * 4);
    var icons = [
        '<i class="fas fa-user-tie"></i>',
        '<i class="fas fa-user-secret"></i>',
        '<i class="fas fa-user-ninja"></i>',
        '<i class="fas fa-user-astronaut"></i>'
    ]
    return icons[random];
}

function setProgressIcon(progress) {
    $('#progressIcon').html('');
    if (progress < 10) {
        $('#progressIcon').append('<i class="far fa-flushed"></i>');
    } else if (progress == 25) {
        $('#progressIcon').append('<i class="far fa-grimace"></i>');
    } else if (progress <= 40) {
        $('#progressIcon').append('<i class="far fa-smile"></i>');
    } else if (progress <= 55) {
        $('#progressIcon').append('<i class="far fa-star"></i>');
    } else if (progress <= 70) {
        $('#progressIcon').append('<i class="far fa-thumbs-up"></i>');
    } else {
        $('#progressIcon').append('<i class="fas fa-trophy"></i>');
    }
}
