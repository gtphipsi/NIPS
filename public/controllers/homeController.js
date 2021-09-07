var USER;
var USERS;
var COMMITTEES;
var USERS_BY_ID;
var TRANSACTIONS;
var REQUESTS;
var REQUESTS_FOR_USER = [];
var REQUESTS_FROM_USER = [];
var TIMEFRAME;


$(document).ready(function() {
    console.log("Loading home page...");

    createNavBar('home');

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

    $('#userLogTable').DataTable({
        searching: false,
        paging: false,
        info: false,
        'order': [[0, 'desc']]
    });

    $('#userRequestsTable').DataTable({
        searching: false,
        paging: false,
        info: false,
        'columnDefs': [
            {
                'targets': [0, -1],
                'visible': false
            },
            {
               'targets': 4,
               'checkboxes': {
                  'selectRow': true
               }
            }
         ],
         'select': {
            'style': 'multi'
         },
         'order': [[1, 'asc']]
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
                console.log("making user log table");
                updateTimeframe();
                updateMetrics(TRANSACTIONS);
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
                        REQUESTS_FOR_USER = getRequestsForUser(USER, REQUESTS, COMMITTEES);
                        for (var r = 0; r < REQUESTS_FOR_USER.length; r++) {
                            var request = REQUESTS_FOR_USER[r];
                            var date = request.date.toString().substring(0, 10);
                            var reason = request.reason;
                            var requester = getName(USERS_BY_ID[request.requesterId]);
                            var newRow = [request.requesterId, date, reason, requester, r, request._id];
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

    $('#deleteButton').off('click');
    $('#deleteButton').click(function() {
        var table = $('#userRequestsTable').DataTable();
        var rowsSelected = table.column(4).checkboxes.selected();
        transactionIds = [];
        $.each(rowsSelected, function(index) {
            var tableIndex = rowsSelected[index];
            var data = table.row(tableIndex).data();
            var requestId = data[5];
            transactionIds.push(requestId);
        });
        if (confirm('Are you sure you want to delete ' + rowsSelected.length + ' requests?')) {
            $('#loadingIcon').show();
            $.ajax({
                url: "/requests",
                type: 'DELETE',
                data: {transactionIds},
                success: function(response) {
                    alert('Requests Successfully Deleted');
                    location.reload();
                },
                done: function() {
                    $('#loadingIcon').hide();
                }
            });
        }
    });

    $('#resolveButton').off('click');
    $('#resolveButton').click(function() {
        var newAmount = window.prompt('Enter an amount for these transactions', 0);
        var table = $('#userRequestsTable').DataTable();
        var rowsSelected = table.column(4).checkboxes.selected();
        console.log(rowsSelected);
        transactions = [];
        transactionIds = [];
        $.each(rowsSelected, function(index) {
            var data = table.row(index).data();
            newTransaction = {
                assigner: USER._id,
                receiver: data[0],
                amount: newAmount,
                dateAssigned: new Date(),
                dateEarned: new Date(data[1]),
                reason: data[2]
            }
            transactions.push(newTransaction);
            var requestId = data[5];
            transactionIds.push(requestId);
         });
         console.log(transactionIds);
         $('#loadingIcon').show();
         console.log('RESOLVING TRANSACTION');
         $.post("/transactions", {transactions}).done(function() {
            $.ajax({
                url: "/requests",
                type: 'DELETE',
                data: {transactionIds},
                success: function(response) {
                    alert('Requests Successfully Resolved');
                    location.reload();
                },
                done: function() {
                    $('#loadingIcon').hide();
                }
            });
        });
    });

    $('#requestSubmit').off('click');
    $('#requestSubmit').click(function() {
        var reason = $('#requestReason').val();
        var assigner = $('#requestAssigner').val();
        var assignerLabel = assigner;
        if (assigner == 'rushChair') {
            assignerLabel = 'Rush Chair';
        } else if (assigner == 'riskManager') {
            assignerLabel = 'Risk Manager';
        }
        var date = $('#requestDate').val();
        if (confirm('Submit request to ' + assignerLabel + ' for ' + reason + ' on ' + date + '?')) {
            var newRequest = {
                requesterId: USER._id,
                assigner: assigner,
                reason: reason,
                date: new Date(date)
            }
            console.log('SUMBITTING REQUESTS')
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
    
    var leaderboard = getLeaderboard(TRANSACTIONS, TIMEFRAME, Object.keys(USERS_BY_ID));
    var transactions = getTransactionsTF(TRANSACTIONS, TIMEFRAME);
    var userRanking = getUserRanking(USER._id, leaderboard);
    console.log("Transaction");
    console.log(transactions);
    console.log("Leaderboard");
    console.log(leaderboard);
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
    makeGraphs(leaderboard, transactions);
    updateProgressBar(userPoints);
}

function updateMetrics(transactions) {
    var leaderboards = getWeeklyLeaderboards(transactions, Object.keys(USERS_BY_ID));
    var brothersOfTheWeek = getBrotherOfTheWeek(leaderboards);
    $('#brotherOfTheWeek').text(userIdsToJoinedString(brothersOfTheWeek));
    var hottestUsers = getHottestStreak(leaderboards);
    $("#hottestStreak").text(userIdsToJoinedString(hottestUsers));
    var biggestClimbers = getBiggestClimber(leaderboards);
    $("#biggestClimber").text(userIdsToJoinedString(biggestClimbers));
}
function userIdsToJoinedString(userIds) {
    var joinedString = '';
    for (var i =0; i< userIds.length; i++) {
        console.log(userIds[i]);
        joinedString += getName(USERS_BY_ID[userIds[i]])+', '
    }
    return joinedString.substring(0,joinedString.length-2)
    
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

function makeGraphs(leaderboard, transactions){
    console.log('drawing graphs');
    var userId = sessionStorage.getItem('userId');
    fraternityHistogram = document.getElementById('fraternityHistogram');
    var x = [];
    var i = 0;
    for (var i=0;i< leaderboard.length;i++){
        x[i] = leaderboard[i].points;
    }
    var trace = {
        x: x,
        type: 'histogram',
        marker: {
            color: '#00703c',
        },
        nbinsx:6
    };
    var data = [trace];
    
    var layout = {
        title: {text:'Brothers\' Points'},
        xaxis: {title: {text:"Points", standoff: 0}}, 
        yaxis: {title: {text:"Brothers", standoff: 0}},
        margin: {b: 40, r:40,l:40},
        plot_bgcolor: '#eeb311',
        paper_bgcolor: '#eeb311',
        showlegend: false
    }
    Plotly.newPlot(fraternityHistogram, data, layout);

    

    var rawDates = [];
    var rawPoints = [];
    
    var j = 0;
    for (var i = 0; i < transactions.length; i++) {
        if (transactions[i]['receiver'] == userId) {
            rawDates[j] = transactions[i]['dateEarned'].split('T')[0];
            rawPoints[j] = parseInt(transactions[i]['amount']);
            j++;
        } 
    }

    var pointDateHash = {};
    for (var i =0; i < rawDates.length; i++) {
        pointDateHash[rawDates[i]] = (rawDates[i] in pointDateHash) ? pointDateHash[rawDates[i]] + rawPoints[i]: rawPoints[i];
    }
        

    var pointDates = [];
    var i = 0;
    for (let dateHash in pointDateHash) {
        pointDates[i] = new PointDate(pointDateHash[dateHash], dateHash);
        i++;
    }

    pointDates.sort(compare);
    runningTotal = [];
    dates = [];
    for (var i = 0; i < pointDates.length; i++) {
        if (i == 0){
            runningTotal[i] = pointDates[i].point;
            dates[i] = pointDates[i].date;
        } else {
            runningTotal[i] = pointDates[i].point + runningTotal[i-1];
            dates[i] = pointDates[i].date;
        }
    }
    var traceLine = {
        y: runningTotal,
        x: dates,
        type: 'scatter',
        mode: "line+marker",
        line: {color: '00703c'}
    };

    var layoutLine = {
        title: {text:'Your Points'},
        xaxis: {title: {text:"Date", standoff: 0}}, 
        yaxis: {title: {text:"Points", standoff: 0}},
        margin: {b: 40, r:40, l:40},
        plot_bgcolor: '#eeb311',
        paper_bgcolor: '#eeb311',
        showlegend: false
    }

    fraternityLine = document.getElementById('fraternityLine');
    Plotly.newPlot(fraternityLine, [traceLine], layoutLine);
    console.log('drawn graphs');
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

class PointDate {
    constructor(point, date) {
        this.point = point;
        this.date = date;
    } 
}

function compare(a,b) {
    if (a.date < b.date) {
        return -1;
    }
    return 1;
}