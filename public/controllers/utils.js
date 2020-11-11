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
function getPositions(user) {
    var positions = [];
    if (!user || !user.officerPositions || !user.committeePositions) {
        return [];
    }
    for (o in user.officerPositions) {
        if (user.officerPositions[o]) {
            positions.push(o);
        }
    }
    for (c in user.committeePositions) {
        if (user.committeePositions[c]) {
            positions.push(c + ' Head');
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
    return leaderboard;
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
    return transactions;
}


/**
 * sort through all transactions and return array of transactions where user is assigner
 * @param {*} user the user id to search for
 * @param {*} transactions array of all transactions
 * @returns array of all transactions where user is assigner
 */
function getUserAssignerTransactions(user, all_transactions) {
    var transactions = [];
    return transactions;
}


/**
 * sort through all transactions and return array of transactions where user is receiver
 * @param {*} user the user id to search for
 * @param {*} transactions array of all transactions
 * @returns array of all transactions where user is receiver
 */
function getUserReceiverTransactions(user, all_transactions) {
    var transactions = [];
    return transactions;
}
