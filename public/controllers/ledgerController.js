var USER;
var USERS;
var USERS_BY_ID;
var COMMITTEES;
var COMMITTEES_BY_ID;
var ALL_USER_IDS = [];
var TRANSACTIONS;
var TRANSACTIONS_BY_ID;
var EDITING_TRANSACTION;
var assigner = "";
var reason = "";
var amount = 0;
var currentGroup;
var currentBrother;
var groups = [];
var log = [];
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
    createNavBar('ledger');

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
               }
            }
         ],
         'select': {
            'style': 'multi'
         },
         'order': [[1, 'asc']]
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
        var transactionIds = [];
        $.each(rowsSelected, function(index) {
            var tableIndex = rowsSelected[index];
            var data = ledgerTable.row(tableIndex).data();
            console.log(data[7]);
            transactionIds.push(data[7]);
        });
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
                if (defaultInfo.assigner != USER._id) {
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
            console.log(data);
            console.log(data[7]);
            if (data[7] == USER._id) {
                transactionIds.push(data[7]);
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
            $('#ledgerTable').DataTable().clear().draw();
            for (var i = 0; i < TRANSACTIONS.length; i++) {
                var currentTransaction = TRANSACTIONS[i];
                var amount = currentTransaction.amount;
                var reason = currentTransaction.reason;
                var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
                var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
                var dateAssigned = changeDateString(currentTransaction.dateAssigned);
                var dateEarned = changeDateString(currentTransaction.dateEarned);
                var newRow = [i, amount, reason, receiver, assigner, dateEarned, dateAssigned, currentTransaction._id];
                $('#ledgerTable').DataTable().row.add(newRow);
            }
            $('#ledgerTable').DataTable().draw();
            $("#loadingIcon").hide();
        });

        var showAllButton = $('#showAllButton');
        var showAssignedButton = $('#showAssignedButton');
        var showReceivedButton = $('#showReceivedButton');

        showAllButton.off('click');
        showAllButton.click(function() {
            $('#ledgerTable').DataTable().clear().draw();
            $('#showAllButton').addClass('selectedButton');
            $('#showAssignedButton').removeClass('selectedButton');
            $('#showReceivedButton').removeClass('selectedButton');
            for (var i = 0; i < TRANSACTIONS.length; i++) {
                var currentTransaction = TRANSACTIONS[i];
                var amount = currentTransaction.amount;
                var reason = currentTransaction.reason;
                var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
                var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
                var dateAssigned = changeDateString(currentTransaction.dateAssigned);
                var dateEarned = changeDateString(currentTransaction.dateEarned);
                var newRow = [i, amount, reason, receiver, assigner, dateEarned, dateAssigned, currentTransaction._id];
                $('#ledgerTable').DataTable().row.add(newRow); 
            }
            $('#ledgerTable').DataTable().draw();
        });

        showAssignedButton.off('click');
        showAssignedButton.click(function() {
            $('#ledgerTable').DataTable().clear().draw();
            $('#showAllButton').removeClass('selectedButton');
            $('#showReceivedButton').removeClass('selectedButton');
            $('#showAssignedButton').addClass('selectedButton');
            var tableIndex = 0;
            for (var i = 0; i < TRANSACTIONS.length; i++) {
                var currentTransaction = TRANSACTIONS[i];
                var amount = currentTransaction.amount;
                var reason = currentTransaction.reason;
                var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
                var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
                var dateAssigned = changeDateString(currentTransaction.dateAssigned);
                var dateEarned = changeDateString(currentTransaction.dateEarned);
                if (assigner == userName) {
                    var newRow = [tableIndex, amount, reason, receiver, assigner, dateEarned, dateAssigned, currentTransaction._id];
                    $('#ledgerTable').DataTable().row.add(newRow);
                    tableIndex++;
                }
            }
            $('#ledgerTable').DataTable().draw();
        });

        showReceivedButton.off('click');
        showReceivedButton.click(function() {
            $('#showAllButton').removeClass('selectedButton');
            $('#showAssignedButton').removeClass('selectedButton');
            $('#showReceivedButton').addClass('selectedButton');
            $('#ledgerTable').DataTable().clear().draw();
            var tableIndex = 0;
            for (var i = 0; i < TRANSACTIONS.length; i++) {
                var currentTransaction = TRANSACTIONS[i];
                var amount = currentTransaction.amount;
                var reason = currentTransaction.reason;
                var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
                var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
                var dateAssigned = changeDateString(currentTransaction.dateAssigned);
                var dateEarned = changeDateString(currentTransaction.dateEarned);
                if (receiver == userName) {
                    var newRow = [tableIndex, amount, reason, receiver, assigner, dateEarned, dateAssigned, currentTransaction._id];
                    $('#ledgerTable').DataTable().row.add(newRow); 
                    tableIndex++;
                }
            }
            $('#ledgerTable').DataTable().draw();
        });

        var ledgerSearchInput = $('#ledgerSearchInput');
        ledgerSearchInput.keyup(function() {
            console.log("Searching");
            var input, filter, table, tr, td, i, txtValue;
            input = document.getElementById("ledgerSearchInput");
            filter = input.value.toUpperCase();
            table = document.getElementById("ledgerTable");
            tr = table.getElementsByTagName("tr");
            for (i = 1; i < tr.length; i++) {
                var contains = false
                var cols = tr[i].getElementsByTagName("td").length;
                for(j = 0; j < cols; j++){
                    td = tr[i].getElementsByTagName("td")[j];
                    if (td && !contains) {
                        txtValue = td.textContent || td.innerText;
                        if (txtValue.toUpperCase().indexOf(filter) > -1) {
                            contains = true;
                        }
                    }
                }
                if (contains) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }       
            }
        });
    });
});

function changeDateString(rawDate) {
    return rawDate.slice(5,7)+'/'+rawDate.slice(8,10)+'/'+rawDate.slice(0,4)
}
