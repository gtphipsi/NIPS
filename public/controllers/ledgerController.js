var USER;
var USERS;
var USERS_BY_ID;
var COMMITTEES;
var COMMITTEES_BY_ID;
var ALL_USER_IDS = [];
var TRANSACTIONS;
var assigner = "";
var reason = "";
var amount = 0;
var currentGroup;
var currentBrother;
var groups = [];
var log = [];
$(document).ready(function() {
    console.log("Loading assign page...");

    $.get("/users", function(data) {
        USERS = data;
        console.log("retrieved user data");
    }).done(function() {
        USERS_BY_ID = createHashmapById(USERS);
        var ledgerTable = $('#ledgerTable').DataTable({
            paging: false,
            info: false,});
    
        var userId = sessionStorage.getItem('userId');
        var userName = USERS_BY_ID[userId].firstName + ' '+  USERS_BY_ID[userId].lastName;
        console.log(userId);
    
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
            console.log("updating ledger table");
            $('#ledgerTable').DataTable().clear().draw();
            for (var i = 0; i < TRANSACTIONS.length; i++) {
                var currentTransaction = TRANSACTIONS[i];
                var amount = currentTransaction.amount;
                var reason = currentTransaction.reason;
                var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
                var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
                var newRow = [amount, reason, receiver, assigner];
                console.log(newRow);
                $('#ledgerTable').DataTable().row.add(newRow);
            }
            console.log(TRANSACTIONS)
            $('#ledgerTable').DataTable().draw();
        });
        var showAllButton = $('#showAllButton');
        var showAssignedButton = $('#showAssignedButton');
        var showRecievedButton = $('#showRecievedButton');

        showAllButton.off('click');
        showAllButton.click(function() {
            $('#ledgerTable').DataTable().clear().draw();
            for (var i = 0; i < TRANSACTIONS.length; i++) {
                var currentTransaction = TRANSACTIONS[i];
                var amount = currentTransaction.amount;
                var reason = currentTransaction.reason;
                var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
                var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
                var newRow = [amount, reason, receiver, assigner];
                $('#ledgerTable').DataTable().row.add(newRow); 
            }
            console.log(TRANSACTIONS)
            $('#ledgerTable').DataTable().draw();
        });

        showAssignedButton.off('click');
        showAssignedButton.click(function() {
            $('#ledgerTable').DataTable().clear().draw();
            for (var i = 0; i < TRANSACTIONS.length; i++) {
                var currentTransaction = TRANSACTIONS[i];
                var amount = currentTransaction.amount;
                var reason = currentTransaction.reason;
                var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
                var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
                var newRow = [amount, reason, receiver, assigner];
                if (userName == assigner) {
                    $('#ledgerTable').DataTable().row.add(newRow); 
                }
            }
            console.log(TRANSACTIONS)
            $('#ledgerTable').DataTable().draw();
        });

        showRecievedButton.off('click');
        showRecievedButton.click(function() {
            $('#ledgerTable').DataTable().clear().draw();
            for (var i = 0; i < TRANSACTIONS.length; i++) {
                var currentTransaction = TRANSACTIONS[i];
                var amount = currentTransaction.amount;
                var reason = currentTransaction.reason;
                var receiver = USERS_BY_ID[currentTransaction.receiver].firstName + ' ' + USERS_BY_ID[currentTransaction.receiver].lastName;
                var assigner = USERS_BY_ID[currentTransaction.assigner].firstName + ' ' + USERS_BY_ID[currentTransaction.assigner].lastName;
                var newRow = [amount, reason, receiver, assigner];
                if (userName == receiver) {
                    $('#ledgerTable').DataTable().row.add(newRow); 
                }
            }
            console.log(TRANSACTIONS)
            $('#ledgerTable').DataTable().draw();
        });
    });
});

