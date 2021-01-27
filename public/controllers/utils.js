/**
 * JavaScript Enum implementation for timeframes
 */
const timeframes = {
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    SEMESTERLY: "semesterly"
}

/**
 * JavaScript Enum implementations for semester timeframes
 */
const fallSemester = {
    STARTDATE: new Date(2020, 08, 01),
    ENDDATE: new Date(2020, 12, 31)
}

const springSemester = {
    STARTDATE: new Date(2020, 11, 18),
    ENDDATE: new Date(2021, 07, 30)
}

/**
 * JavaScript Enum implementation for semester label
 */
const semester = {
    FALL: "fall",
    SPRING: "spring"
}

/**
 * JavaScript Enum implementation for recommmended participation
 */
const recommended = {
    WEEK: 10,
    MONTH: 40,
    SEMESTER: 150
}

/**
 * JavaScript Enum implementation for positions
 */
const positions = {
    GP: "GP",
    VGP: "VGP",
    P: "P",
    NME: "NME",
    BG: "BG",
    SG: "SG",
    AG: "AG",
    PHU: "Phu",
    HI: "Hi",
    MISC: "Misc",
    COMMITTEE: "Committee",
    RISK_MANAGER: "Risk Manager",
    RUSH_CHAIR: "Rush Chair"
}

function getName(user) {
    return user.firstName + " " + user.lastName;
}
/**
 * takes an array of objects with _id fields and creates a hashmap with
 * the _id value as the index for fast and easy access/reference
 * @param {*} data array of data (can be any object that has a _id field)
 * @returns hashmap containing all the objects from data at index of their _id
 */
function createHashmapById(data) {
    if (!data || !data.length || data.length == 0) {
        console.log("hashmap data is erroneous/empty");
        return {};
    }
    var hashmap = {};
    for (var i = 0; i < data.length; i++) {
        var id = data[i]._id;
        hashmap[id] = data[i];
    }
    return hashmap;
}


/**
 * creates an array from the boolean values of a user's positions
 * use mainly to add to a select list or check user permissions
 * @param {*} user a User object from MongoDB
 * @returns array of officer and committee head positions held
 */
function getPositions(user, committees) {
    var positions = [];
    if (!user || !user.officerPositions || !committees) {
        return [];
    }
    for (o in user.officerPositions) {
        if (user.officerPositions[o]) {
            positions.push(o);
        }
    }
    for (c in committees) {
        if (committees[c].head == user._id) {
            positions.push(committees[c].committee + ' Head');
        }
    }
    return positions;
}


/**
 * get point values from util function
 * iterate point values and add to array
 * sort array in descending order
 * @param {*} transactions array of transactions from GET request
 * @param {*} timeframe String (enum ?) representing the timeframe (weekly, monthly, semesterly)
 * @returns array containing all users sorted in descending order by points earned
 */
function getLeaderboard(transactions, timeframe) {
    var leaderboard = [];
    var pointValues = getPointValues(transactions, timeframe);
    for (userId in pointValues) {
        var obj = {
            id: userId,
            points: pointValues[userId]
        }
        leaderboard.push(obj);
    }
    leaderboard.sort((a, b) => {
        return b.points - a.points;
    });
    return leaderboard;
}

function getTransactionsTF(transactions, timeframe) {
    var transactionsTF = []
    var i = 0
    while (i< transactions.length) {
        if (isInTimeframe(transactions[i], timeframe)) {
            transactionsTF[transactionsTF.length] = transactions[i];
        }
        i++;
    }
    return transactionsTF
}


/**
 * create hashmap of { userId: pointValue }
 * loop through all transactions and check if matching timeframe
 * if matching timeframe add point value to user in hashmap
 * @param {*} transactions array of transactions from GET request
 * @param {*} timeframe String (enum ?) representing the timeframe (weekly, monthly, semesterly)
 * @returns hashmap linking userId to points earned in given timeframe
 */
function getPointValues(transactions, timeframe) {
    var pointValues = {};
    console.log("trasn");
    console.log(timeframe);
    for (var i = 0; i < transactions.length; i++) {
        if (isInTimeframe(transactions[i], timeframe)) {
            console.log("in timeframe");
            var receiverId = transactions[i].receiver;
            if (pointValues[receiverId]) {
                pointValues[receiverId] = parseInt(pointValues[receiverId]) + parseInt(transactions[i].amount);
            } else {
                pointValues[receiverId] = parseInt(transactions[i].amount);
            }
        }
    }
    return pointValues;
}


/**
 * sort through all transactions and return array of transactions involving user
 * @param {*} user the user id to search for
 * @param {*} transactions array of all transactions
 * @returns array of all transactions where user is assigner or receiver
 */
function getAllUserTransactions(user, all_transactions) {
    var transactions = [];
    var userId = user._id;
    for (var i = 0; i < all_transactions.length; i++) {
        if (all_transactions[i].assigner == userId || all_transactions[i].receiver == userId) {
            transactions.push(all_transactions[i]);
        }
    }
    return transactions;
}


/**
 * sort through all transactions and return array of transactions where user is assigner
 * @param {*} userId the user id to search for
 * @param {*} transactions array of all transactions
 * @returns array of all transactions where user is assigner
 */
function getUserAssignerTransactions(userId, all_transactions) {
    var transactions = [];
    for (var i = 0; i < all_transactions.length; i++) {
        if (all_transactions[i].assigner == userId) {
            transactions.push(all_transactions[i]);
        }
    }
    return transactions;
}


/**
 * sort through all transactions and return array of transactions where user is receiver
 * @param {*} userId the user id to search for
 * @param {*} transactions array of all transactions
 * @returns array of all transactions where user is receiver
 */
function getUserReceiverTransactions(userId, all_transactions) {
    var transactions = [];
    for (var i = 0; i < all_transactions.length; i++) {
        if (all_transactions[i].receiver == userId) {
            transactions.push(all_transactions[i]);
        }
    }
    return transactions;
}


/**
 * 
 * @param {*} userId userId to search for
 * @param {*} leaderboard array of objects containing userIds and points earned
 */
function getUserRanking(userId, leaderboard) {
    var ranking = 0;
    for (var i = 0; i < leaderboard.length; i++) {
        if (leaderboard[i].id == userId) {
            ranking = i + 1;
            break;
        }
    }
    return ranking;
}


/**
 * check if a transaction falls within a certain timeframe
 * @param {*} transaction transaction to check
 * @param {*} timeframe "enum" indicating timeframe to check for
 * @returns true if transaction is in timeframe, false otherwise
 */
function isInTimeframe(transaction, timeframe) {
    if (timeframe == timeframes.WEEKLY) {
        return isThisWeek(transaction.dateEarned);
    } else if (timeframe == timeframes.MONTHLY) {
        return isThisMonth(transaction.dateEarned);
    } else if (timeframe == timeframes.SEMESTERLY) {
        var currentSemester = getCurrentSemester();
        if (currentSemester == semester.FALL) {
            return isInFallSemester(transaction.dateEarned);
        } else if (currentSemester == semester.SPRING) {
            return isInSpringSemester(transaction.dateEarned);
        } else {
            return false;
        }
    } else {
        console.log("TIME FRAME ERROR");
        return false;
    }
}

/**
 * Below are functions performing calculations to determine if
 * a given date is within a certain range
 * @param {*} date the date to check
 * @returns true if date is within range, false otherwise
 */
function isInFallSemester(date) {
    var now = new Date(date);
    return fallSemester.STARTDATE <= now && now <= fallSemester.ENDDATE;
}
function isInSpringSemester(date) {
    var now = new Date(date);
    return springSemester.STARTDATE <= now && now <= springSemester.ENDDATE;
}
function isThisWeek(date) {
    var now = new Date();
    var earned = new Date(date);
    var weekDay = now.getDay();
    return (now - earned) / 86400000 <= weekDay;
}
function isThisMonth(date) {
    var now = new Date();
    var earned = new Date(date);
    var monthDay = now.getDate();
    return (now - earned) / 86400000 <= monthDay;
}

/**
 * Checks what current semester is
 * @returns fall or spring semester "enum" values
 */
function getCurrentSemester() {
    var now = new Date();
    if (isInFallSemester(now)) {
        return semester.FALL;
    } else if (isInSpringSemester(now)) {
        return semester.SPRING;
    } else {
        console.log("COULD NOT MATCH SEMESTER DATE");
        return "none";
    }
}

/* *********************************************************************** */
/**
 * Below are functions performing statistical calculations
 * relating to overall fraternity point amounts
 * @param {*} leaderboard the leaderboard array to get point values from
 */
function getMean(leaderboard) {
    if (!leaderboard || leaderboard.length == 0) {
        return 0;
    }
    var sum = 0;
    for (var i = 0; i < leaderboard.length; i++) {
        sum += parseInt(leaderboard[i].points);
    }
    return sum / leaderboard.length;
}
function getMedian(leaderboard) {
    if (!leaderboard || leaderboard.length == 0) {
        return 0;
    }
    var middle = Math.floor(leaderboard.length / 2);
    return leaderboard[middle].points;
}
function getHigh(leaderboard) {
    if (!leaderboard || leaderboard.length == 0) {
        return 0;
    }
    return leaderboard[0].points;
}
function getLow(leaderboard) {
    if (!leaderboard || leaderboard.length == 0) {
        return 0;
    }
    return leaderboard[leaderboard.length - 1].points;
}
/* *********************************************************************** */


/**
 * function to create top navbar on each page
 * useful for not having to edit every html file when a new page is added
 * TO USE: call at beginning of $(document).ready function
 * ensure that there is a navbar div with id="navbar" in correct place in html file
 */
function createNavBar(page) {
    var home = '<a class=topNavLink id=homeNav href="/home"><i class="fas fa-home"></i> Home</a>';
    var assign = '<a class=topNavLink id=assignNav href="/assign"><i class="fas fa-plus"></i> Assign</a>';
    var ledger = '<a class=topNavLink id=ledgerNav href="/ledger"><i class="fas fa-book"></i> Ledger</a>';
    var admin = '<a class=topNavLink id=adminNav href="/admin"><i class="fas fa-cog"></i> Admin</a>';
    var committees = '<a class=topNavLink id=committeesNav href = "/viewcommittees"><i class="fas fa-users"></i> Committees';
    var matrix = '<a class=topNavLink id=matrixNav href="/matrix"><i class="fas fa-th-list"></i> Matrix';
    var signout = '<button id=signoutButton><i class="fas fa-sign-out-alt"></i> Sign Out</button>';
    
    $('#navbar').append(home);
    $('#navbar').append(assign);
    $('#navbar').append(ledger);
    $('#navbar').append(committees);
    $('#navbar').append(matrix);
    $('#navbar').append(admin);
    $('#navbar').append(signout);

    switch (page) {
        case 'home':
            $('#homeNav').addClass('currentPage');
            $('#homeNav').removeClass('topNavLink');
            break;
        case 'assign':
            $('#assignNav').addClass('currentPage');
            $('#assignNav').removeClass('topNavLink');
            break;
        case 'ledger':
            $('#ledgerNav').addClass('currentPage');
            $('#ledgerNav').removeClass('topNavLink');
            break;
        case 'admin':
            $('#adminNav').addClass('currentPage');
            $('#adminNav').removeClass('topNavLink');
            break;
        case 'committees':
            $('#committeesNav').addClass('currentPage');
            $('#committeesNav').removeClass('topNavLink');
            break;
        case 'matrix':
            $('#matrixNav').addClass('currentPage');
            $('#matrixNav').removeClass('topNavLink');
            break;
        default:
            break;
    }
    
}


/**
 * helper function to alert and redirect user if no userId is found in sessionStorage
 * @param {*} userId value retrieved from sessionStorage
 */
function checkLoggedIn(userId) {
    if (!userId) {
        alert("USER NOT LOGGED IN\nRETURNING TO LOGIN PAGE");
        console.log("failed retrieving userId--returning to login page");
        window.location = '/';
    }
}


/**
 * helper function to add common footer to html
 * requires jquery code in controller files to activate button click
 */
function addFooter() {
    var label = "<button><a href='https://github.com/gtphipsi/NIPS/issues/new?title=YOUR%20ISSUE&body=DESCRIPTION' target='_blank'><h3>";
    label += "<i class='fas fa-exclamation-triangle'></i> Report an Issue</h3></a></button>";
    $('footer').append(label);
}


/**
 * helper function to use user's officer positions to find all outstanding requests
 * made with current user as the assigner
 * @param {*} user current user
 * @param {*} requests list of all requests
 * @return list of request objects
 */
function getRequestsForUser(user, requests, committees) {
    console.log('finding requests for user');
    if (!user || !requests || requests.length == 0) {
        return [];
    }
    outstandingRequests = [];
    var userPositions = getPositions(user, committees);
    console.log(userPositions);
    for (var i = 0; i < requests.length; i++) {
        if (userPositions.indexOf(requests[i].assigner) >= 0) {
            outstandingRequests.push(requests[i]);
        } else {
            console.log(requests[i].assigner);
        }
    }
    return outstandingRequests;
}


/**
 * helper function to find all outstanding requests made with current user
 * as requester
 * @param {*} userId ObjectId of current user
 * @param {*} requests list of requests
 * @return list of request objects
 */
function getRequestsFromUser(userId, requests) {
    console.log('finding requests from user');
    if (!userId || !requests || requests.length == 0) {
        return [];
    }
    outstandingRequests = [];
    for (var i = 0; i < requests.length; i++) {
        if (requests[i].requesterId == userId) {
            outstandingRequests.push(requests[i]);
        } else {
            console.log(requests[i].requesterId);
        }
    }
    return outstandingRequests;
}
