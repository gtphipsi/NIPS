var USER;
var USERS;
var USERS_BY_ID;
var COMMITTEES;
var COMMITTEES_BY_ID;
var ALL_USER_IDS = [];
var TRANSACTIONS = [];
var DATE_ASSIGNED;
var DATE_EARNED = new Date();
var ASSIGNER = "";
var REASON = "";
var AMOUNT = 0;
var CUSTOM_AMOUNTS = {};
var currentGroup;
var currentBrother;
var groups = [];
var log = [];

$(document).ready(function() {
    console.log("Loading assign page...");

    createNavBar('assign');

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

    DATE_ASSIGNED = new Date();
    console.log("Today's Date", DATE_ASSIGNED);

    $('#logTable').DataTable({
        searching: false,
        paging: false,
        info: false,
        autoWidth: false,
        "columnDefs": [{
            "targets": 1,
            "className": "editable amount"
        },
        {
            "targets": -1,
            "visible": false
        }]
    });
    $('#logTable').on('click', 'tbody td.editable', function(e) {
        var table = $('#logTable').DataTable();
        var row = table.row($(this).parents('tr'));
        var data = row.data();
        var newAmount = window.prompt('Amount', AMOUNT);
        if (!newAmount) {
            newAmount = 0;
        }
        CUSTOM_AMOUNTS[data[5]] = newAmount;
        data[1] = newAmount;
        table.row($(this).parents('tr')).data(data).draw();
    });

    var groupsTable = $('#groupsTable').DataTable({
        searching: false,
        paging: false,
        info: false,
        autoWidth: false,
        "columnDefs": [{
            "targets": 0,
            "data": null,
            "defaultContent": "<button class='deleteButton'><i class='far fa-window-close'></i></button>",
            "width": "10%",
            "className": "text-center"
        },
        {
            "targets": -1,
            "visible": false
        }]
    });
    $('#groupsTable tbody').on('click', 'button', function() {
        var row = groupsTable.row($(this).parents('tr'));
        var groupId = row.data()[2];
        var index = groups.indexOf(groupId);
        console.log("groupId:", groupId);
        if (index >= 0) {
            groups.splice(index, 1);
            var members = COMMITTEES_BY_ID[groupId].members;
            for (var i = 0; i < members.length; i++) {
                if (!isInOtherGroup(groups, members[i])) {
                    removeFromAllUserIds(members[i]);
                }
            }
        }
        row.remove().draw();
        updateBrotherTable();
    });

    var brothersTable = $('#brothersTable').DataTable({
        searching: false,
        paging: false,
        info: false,
        autoWidth: false,
        "columnDefs": [{
            "targets": 0,
            "data": null,
            "defaultContent": "<button class='deleteButton'><i class='far fa-window-close'></i></button>",
            "width": "10%",
            "className": "text-center"
        },
        {
            "targets": -1,
            "visible": false
        }]
    });
    $('#brothersTable tbody').on('click', 'button', function() {
        var row = brothersTable.row($(this).parents('tr'));
        var brotherId = row.data()[2];
        var index = ALL_USER_IDS.indexOf(brotherId);
        if (index >= 0) {
            ALL_USER_IDS.splice(index, 1);
            removeFromAllUserIds(brotherId);
        }
        row.remove().draw();
        updateLogTable();
    });

    var assigningAs = $('#assigningAs');
    var assignReason = $('#assignReason');
    var assignAmount = $('#assignAmount');
    var assigningGroup = $('#assigningGroup');
    var assigningBrother = $('#assigningBrother');
    var addGroupButton = $('#addGroupButton');
    var addBrotherButton = $('#addBrotherButton');
    var submitPointsButton = $('#submitPointsButton');

    var userURL = '/users/' + userId;
    $.get(userURL, function(data) {
        USER = data;
        console.log("retrieved user data");
    }).done(function() {
        var positions = getPositions(USER);
        for (var i = 0; i < positions.length; i++) {
            assigningAs.append(`<option value=${positions[i]}>${positions[i]}</option>`);
        }
    });

    $.get("/users", function(data) {
        USERS = data;
        console.log("retrieved all user data");
    }).done(function() {
        for (var i = 0; i < USERS.length; i++) {
            assigningBrother.append(`<option value=${USERS[i]._id}>${USERS[i].firstName} ${USERS[i].lastName}</option>`);
        }
        USERS_BY_ID = createHashmapById(USERS);
    });

    $.get('/committees', function(data) {
        COMMITTEES = data;
        console.log("retrieved committee data");
    }).done(function() {
        for (var i = 0; i < COMMITTEES.length; i++) {
            assigningGroup.append(`<option value=${COMMITTEES[i]._id}>${COMMITTEES[i].committee}</option>`);
        }
        COMMITTEES_BY_ID = createHashmapById(COMMITTEES);
    });

    addGroupButton.off('click');
    addGroupButton.click(function() {
        if (currentGroup != 'None') {
            if (groups.indexOf(currentGroup) < 0) {
                groups.push(currentGroup);
                console.log("GROUPS");
                console.log(groups);
            }
            var members = COMMITTEES_BY_ID[currentGroup].members;
            console.log("MEMBERS");
            console.log(members);
            for (var i = 0; i < members.length; i++) {
                if (ALL_USER_IDS.indexOf(members[i]) < 0) {
                    ALL_USER_IDS.push(members[i]);
                }
            }
        }
        updateGroupTable();
    });

    addBrotherButton.off('click');
    addBrotherButton.click(function() {
        if (currentBrother != 'None') {
            if (ALL_USER_IDS.indexOf(currentBrother) < 0) {
                ALL_USER_IDS.push(currentBrother);
            }
            if (ALL_USER_IDS.indexOf(currentBrother) < 0) {
                ALL_USER_IDS.push(currentBrother);
            }
        }
        console.log(ALL_USER_IDS);
        updateBrotherTable();
    });

    submitPointsButton.off('click');
    submitPointsButton.click(function() {
        if (confirm('Are you sure you want to submit these points?')) {
            var validForm = validateForm();
            var transactions = getTransactions();
            console.log(transactions);
            if (validForm && transactions.length > 0) {
                $.post("/transactions", {transactions}).done(function() {
                    alert('Transactions Submitted Successfully');
                    location.reload();
                });
            } else {
                alert('Unable to submit points :(');
            }
        }
    });
});


function updateAssigningAs() {
    ASSIGNER = assigningAs.value;
    updateLogTable();
}

function updateReason() {
    REASON = assignReason.value;
    updateLogTable();
}

function updateAmount() {
    AMOUNT = assignAmount.value;
    updateLogTable();
}

function updateGroup() {
    currentGroup = assigningGroup.value;
}

/**
 * TODO: don't allow future dates
 */
function updateDate() {
    DATE_EARNED = $('#assignDate').val() + 'T00:00:00';
}

function updateGroupTable() {
    $('#groupsTable').DataTable().clear().draw();
    for (var i = 0; i < groups.length; i++) {
        var committee = COMMITTEES_BY_ID[groups[i]].committee
        var newRow = ['', committee, groups[i]];
        $('#groupsTable').DataTable().row.add(newRow);
    }
    $('#groupsTable').DataTable().draw();
    updateBrotherTable();
}

function updateBrother() {
    currentBrother = assigningBrother.value;
    console.log("New Brother:", currentBrother);
}

function updateBrotherTable() {
    $('#brothersTable').DataTable().clear().draw();
    for (var i = 0; i < ALL_USER_IDS.length; i++) {
        var brother = USERS_BY_ID[ALL_USER_IDS[i]].firstName + ' ' + USERS_BY_ID[ALL_USER_IDS[i]].lastName;
        var newRow = ['', brother, ALL_USER_IDS[i]];
        $('#brothersTable').DataTable().row.add(newRow);
    }
    $('#brothersTable').DataTable().draw();
    updateLogTable();
}

function updateLogTable() {
    if (!ALL_USER_IDS || ALL_USER_IDS.length == 0) {
        console.log("user ids empty");
        $('#logTable').DataTable().clear().draw();
        return;
    }
    console.log("updating log table");
    $('#logTable').DataTable().clear().draw();
    for (var i = 0; i < ALL_USER_IDS.length; i++) {
        var currentUser = USERS_BY_ID[ALL_USER_IDS[i]];
        var name = currentUser.firstName + ' ' + currentUser.lastName;
        var amt = AMOUNT;
        if (CUSTOM_AMOUNTS[ALL_USER_IDS[i]]) {
            amt = CUSTOM_AMOUNTS[ALL_USER_IDS[i]];
        }
        var amountColumn = amt;
        var newRow = [
            name,
            amountColumn,
            REASON,
            ASSIGNER,
            DATE_ASSIGNED.toString().substring(0, 10),
            ALL_USER_IDS[i]
        ];
        $('#logTable').DataTable().row.add(newRow);
    }
    $('#logTable').DataTable().draw();
}

function removeFromAllUserIds(id) {
    var index = ALL_USER_IDS.indexOf(id);
    if (index >= 0) {
        ALL_USER_IDS.splice(index, 1);
    }
}

function isInOtherGroup(groups, memberId) {
    if (!memberId || !groups || groups.length == 0) {
        return false;
    }
    var isFound = false;
    for (var i = 0; i < groups.length; i++) {
        if (COMMITTEES_BY_ID[groups[i]].members.indexOf(memberId) >= 0) {
            isFound = true;
            break;
        }
    }
    return isFound;
}

function getTransactions() {
    var assignerId = USER._id;
    var logTable = $('#logTable').DataTable();
    var transactions = [];
    var data = logTable.rows().data();
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        var receiverId = row[5];
        var amount = row[1];
        var new_transaction = {
            reason: REASON,
            assigner: assignerId,
            receiver: receiverId,
            amount: amount,
            dateAssigned: new Date(DATE_ASSIGNED),
            dateEarned: new Date(DATE_EARNED)
        }
        if (validateTransaction(new_transaction, i + 1)) {
            transactions.push(new_transaction);
        }
    }
    return transactions;
}

/**
 * helper function to check each transaction before adding to database
 * if a function has some missing/corrupted data, we want to alert the user and not add it
 * @param {*} transaction transaction to check to ensure proper data
 */
function validateTransaction(transaction, rowNumber) {
    console.log(`Validating transaction ${rowNumber}`);
    console.log(transaction);
    var alertMessage = `TRANSACTION ${rowNumber}` + '\n';
    var errorCaught = false;
    if (!transaction.reason || transaction.reason == '') {
        alertMessage += `--MISSING REASON` + '\n';
        errorCaught = true;
    }
    if (!transaction.assigner || transaction.assigner == '') {
        alertMessage += '--UNABLE TO DETERMINE ASSIGNER ID' + '\n';
        errorCaught = true;
    }
    if (!transaction.receiver || transaction.receiver == '') {
        alertMessage += '--UNABLE TO DETERMINE RECEIVER ID' + '\n';
        errorCaught = true;
    }
    if (!transaction.amount) {
        alertMessage += `--MISSING AMOUNT` + '\n';
        errorCaught = true;
    } else if (isNaN(transaction.amount)) {
        alertMessage += `--AMOUNT NOT A NUMBER: ${transaction.amount}` + '\n';
    }
    if (!transaction.assigner || transaction.assigner == '') {
        alertMessage += '--UNABLE TO DETERMINE ASSIGNER ID' + '\n';
        errorCaught = true;
    }
    if (!isValidDate(transaction.dateEarned)) {
        alertMessage += `--DATE EARNED NOT VALID: ${transaction.dateEarned}` + '\n';
        errorCaught = true;
    }
    if (errorCaught) {
        alert(alertMessage);
        return false;
    }
    return true;
}

/**
 * helper function to ensure form is filled out and data will
 * not be null/undefined
 */
function validateForm() {
    var alertMessage = '';
    var errorCaught = false;
    if (!REASON || REASON == '') {
        alertMessage += 'Please fill out the \"Reason\" field\n';
        errorCaught = true;
    }
    if (!isValidDate(DATE_EARNED)) {
        alertMessage = 'Please enter a valid date in the format mm/dd/yyyy\n';
        errorCaught = true;
    }
    if (errorCaught) {
        alert(alertMessage);
        return false;
    }
    return true;
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }
