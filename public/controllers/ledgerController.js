var USER;
var USERS;
var USERS_BY_ID;
var COMMITTEES;
var COMMITTEES_BY_ID;
var ALL_USER_IDS = [];
var TRANSACTIONS;
var TRANSACTIONS_BY_ID;
var USER_TRANSACTIONS;
var USER_TRANSACTIONS_BY_ID;
var ALL_TRANSACTIONS;
var ALL_TRANSACTIONS_BY_ID;
var EDITING_TRANSACTION;
var SEARCH_TEXT = "";
var assigner = "";
var reason = "";
var amount = 0;
var adminPriveleges = false;
var currentGroup;
var currentBrother;
var groups = [];
var log = [];
var expanded = false;

$(document).ready(function() {
    console.log("Loading assign page...");

    createNavBar('ledger');

    $('#showAllButton').addClass('selectedButton');

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

    var ledgerTable = $('#ledgerTable').DataTable({
        searching: false,
        paging: false,
        info: false,
        'columnDefs': [
            {
                'targets': -1,
                'visible': false
            },
            {
               'targets': 0,
               'checkboxes': {
                  'selectRow': true
               }, "width": "5%"
            },
            {
                targets: "_all",
                orderable: false
             },
         ],
         'select': {
            'style': 'multi'
         }
    });

    var editDialog = $("#editDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 200,
        position: {
            my: "center",
            at: "center",
            of: window
        }
    });

    $('#editTransactionButton').click(function() {
        editDialog.dialog('open');
    });

    $('#editTransactionSubmit').off('click');
    $('#editTransactionSubmit').click(function() {
        var ledgerTable = $('#ledgerTable').DataTable();
        var rowsSelected = ledgerTable.column(0).checkboxes.selected();
        console.log("rows selected");
        console.log(rowsSelected);
        var transactionIds = [];
        $.each(rowsSelected, function(index) {
            var tableIndex = rowsSelected[index];
            var data = ledgerTable.row(tableIndex).data();
            console.log("rows data");
            console.log(data);
            transactionIds.push(data[data.length-1]);
        });
        console.log("transactinos ids");
        console.log(transactionIds);
        if (transactionIds.length < 1) {
            alert('no transactions selected');
            return;
        }
        console.log(transactionIds);
        var reason = $('#editReason').val();
        var amount = $('#editAmount').val();
        var dateEarned = $('#editDateEarned').val();
        var changesMade = 0;
        if (confirm('Edit ' + transactionIds.length + ' transactions?')) {
            for (var i = 0; i < transactionIds.length; i++) {
                var defaultInfo = TRANSACTIONS_BY_ID[transactionIds[i]];
                if (defaultInfo.assigner != USER._id && !adminPriveleges) {
                    alert('You may only edit transactions that you have assigned');
                } else {
                    var newReason = reason ? reason : defaultInfo.reason;
                    var newAmount = amount ? amount : defaultInfo.amount;
                    var newDateEarned = dateEarned ? dateEarned : defaultInfo.dateEarned;
                    var updateTransaction = {
                        _id: transactionIds[i],
                        reason: newReason,
                        amount: newAmount,
                        dateEarned: newDateEarned
                    }
                    var putURL = "/transactions/" + transactionIds[i];
                    $('#loadingIcon').show();
                    $.ajax({
                        url: putURL,
                        type: 'PUT',
                        data: updateTransaction,
                        done: function() {
                            $('#loadingIcon').hide();
                        }
                    });
                    changesMade++;
                }
            }
            if (changesMade > 0) {
                alert('Changes submitted');
            }
        } else {
            alert('Changes not submitted');
        }
    });

    $('#deleteTransactionButton').click(function() {
        var rowsSelected = ledgerTable.column(0).checkboxes.selected();
        var transactionIds = [];
        $.each(rowsSelected, function(index) {
            var tableIndex = rowsSelected[index];
            var data = ledgerTable.row(tableIndex).data();
            if (data[4] == USER._id || (adminPriveleges&&USER.admin)) {
                transactionIds.push(data[data.length - 1]);
            } else {
                alert('You may only delete transactions that you have assigned');
            }
        });
        if (transactionIds.length < 1) {
            return;
        }
        if (confirm('Delete ' + transactionIds.length + ' transactions?')) {
            $('#loadingIcon').show();
            $.ajax({
                url: "/transactions",
                type: 'DELETE',
                data: {transactionIds},
                success: function(response) {
                    alert('Transactions Successfully Deleted');
                    location.reload();
                },
                done: function() {
                    $('#loadingIcon').hide();
                }
            });
        }
    });

    $('#adminTransactionButton').click(function() {
        if (USER.admin) {
            adminPriveleges = !adminPriveleges;
            TRANSACTIONS = USER_TRANSACTIONS == TRANSACTIONS ? ALL_TRANSACTIONS : USER_TRANSACTIONS;
            TRANSACTIONS_BY_ID = USER_TRANSACTIONS_BY_ID == TRANSACTIONS_BY_ID ? ALL_TRANSACTIONS_BY_ID : USER_TRANSACTIONS_BY_ID;
            makeLedger();
            console.log(document.getElementById("adminTransactionButton").innerHTML);
            document.getElementById("adminTransactionButton").innerHTML = adminPriveleges ? '<i class="far fa-cogs" aria-hidden="true"></i> User' : '<i class="far fa-cogs" aria-hidden="true"></i> Admin';
            
        } else {
            alert("ACCESS DENIED\nUser does not have admin priviledges");
        }
        
    });

    $('#ledgerSearchInput').keyup(function () {
        makeLedger();
    });

    $.get("/users", function(data) {
        USERS = data;
        console.log("retrieved user data");
    }).done(function() {
        USERS_BY_ID = createHashmapById(USERS);
    
        var userName = USERS_BY_ID[userId].firstName + ' '+  USERS_BY_ID[userId].lastName;
        USER = USERS_BY_ID[userId];
        var userURL = '/ledger/' + userId;
        $.get(userURL, function(data) {
            TRANSACTIONS = data;
            console.log("retrieved transaction data");
            console.log(data);
        }).done(function() {
            if (!TRANSACTIONS || TRANSACTIONS.length == 0) {
                console.log("no transactinos");
                $('#ledgerTable').DataTable().clear().draw();
                return;
            }
            TRANSACTIONS_BY_ID = createHashmapById(TRANSACTIONS);
            console.log("updating ledger table");
            USER_TRANSACTIONS = TRANSACTIONS;
            USER_TRANSACTIONS_BY_ID = TRANSACTIONS_BY_ID;
            makeLedger();
        });

        var ledgerSearchInput = $('#ledgerSearchInput');
        ledgerSearchInput.keyup(function() {
            SEARCH_TEXT = document.getElementById("ledgerSearchInput").value.toUpperCase();
            makeLedger();
        });
        $.get("/transactions", function(data) {
            ALL_TRANSACTIONS = data;
            console.log("retrieved transaction data");
            console.log(data);
        }).done(function() {
            if (!ALL_TRANSACTIONS || ALL_TRANSACTIONS.length == 0) {
                console.log("no transactinos");
                return;
            }
            ALL_TRANSACTIONS_BY_ID = createHashmapById(ALL_TRANSACTIONS);
        });
    });
});

function makeLedger() {
    $('#loadingIcon').show();
    drawLedger(reorderLedger(filterLedger(TRANSACTIONS)));
    $('#loadingIcon').hide();
}

function drawLedger(ledger){
    
    var tableIndex = 0;
    var table =  $('#ledgerTable').DataTable()
    table.clear().draw();
    var rows = []
    for (var i = 0; i < ledger.length; i++) {
        var currentTransaction = ledger[i];
        var amount = currentTransaction.amount;
        var reason = currentTransaction.reason;
        var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
        var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
        var dateAssigned = changeDateString(currentTransaction.dateAssigned);
        var dateEarned = changeDateString(currentTransaction.dateEarned);
        var newRow = [tableIndex, amount,reason, receiver, assigner, dateEarned, dateAssigned,currentTransaction._id];
        rows[i] = newRow;
        tableIndex++;
    }
    table.rows.add(rows);
    table.draw();
}

function filterLedger(transactions){
    var keptTransactions = []
    var toAdd = true;
    var transaction;
    console.log($('#ledgerSearchInput').value);
    for (var i = 0; i< transactions.length;i++) {
        transaction = transactions[i];
        if (document.getElementById('AssignedCheck').checked) {
            toAdd = toAdd && transaction.assigner == USER._id;
        }
        if (document.getElementById('ReceivedCheck').checked) {
            toAdd = toAdd && transaction.receiver == USER._id;
        }
        if (document.getElementById('ThisWeekCheck').checked) {
            toAdd = toAdd && isThisWeek(transaction.dateEarned)
        }
        if (document.getElementById('ThisMonthCheck').checked) {
            toAdd = toAdd && isThisMonth(transaction.dateEarned)
        }
        
        if (toAdd) {
            keptTransactions[keptTransactions.length] = transaction;
        }
        toAdd = true;
    }
    return keptTransactions;
}

function reorderLedger(transactions) {
    $('#ledgerTable').DataTable().clear().draw();
    $('#loadingIcon').show();
    var sorting = document.getElementById("sortValueMenu").value;
    console.log("reordering by " + sorting);
    var sortedTransactions = [];
    for (var i = 0; i < transactions.length; i++) {
        sortedTransactions[i] = transactions[i];
    }
    sortedTransactions.reverse();
    sortedTransactions.sort(getCompare(sorting));
    return sortedTransactions;
}

function getCompare(sorting) {  
    if (sorting == 'Reason') {
        return compareByReason;
    }
    if (sorting == "Receiver") {
        return compareByReciever;
    }
    if (sorting == "Assigner") {
        return compareByAssigner;
    }
    if (sorting == "Amount") {
        return compareByAmount;
    }
    return compareByDate;
}

function compareByDate(x, y) {
    return x.dateEarned == y.dateEarned ? 0 : x.dateEarned < y.dateEarned ? 1 : -1;
}

function compareByReciever(x, y) {
    x = USERS_BY_ID[x.receiver].firstName + ' ' + USERS_BY_ID[x.receiver].lastName;
    y = USERS_BY_ID[y.receiver].firstName + ' ' + USERS_BY_ID[y.receiver].lastName;
    return x == y ? 0 : x > y ? 1 : -1;
}

function compareByAssigner(x, y) {
    x = USERS_BY_ID[x.assigner].firstName + ' ' + USERS_BY_ID[x.assigner].lastName;
    y = USERS_BY_ID[y.assigner].firstName + ' ' + USERS_BY_ID[y.assigner].lastName;
    return x == y ? 0 : x > y ? 1 : -1;
}

function compareByAmount(x, y) {
    return x.amount == y.amount ? 0 : x.amount < y.amount ? 1 : -1;
}

function compareByReason(x, y) {
    return x.reason == y.reason ? 0 : x.reason > y.reason ? 1 : -1;
}


function changeDateString(rawDate) {
    return rawDate.slice(5,7)+'/'+rawDate.slice(8,10)+'/'+rawDate.slice(0,4)
}

function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
      checkboxes.style.display = "block";
      expanded = true;
    } else {
      checkboxes.style.display = "none";
      expanded = false;
    }
  }
