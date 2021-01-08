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

    var userURL = '/users/' + userId;
    var USER;
    $.get(userURL, function(data) {
        USER = data;
        console.log("retrieved one user data");
        console.log(data);
    }).fail(function() {
        alert("failed retrieving user data--returning to login page");
        window.location = '/';
    }).done(function() {
        createNavBar('ledger',USER);
        checkAccess('ledger',USER);
    });

    $.get("/users", function(data) {
        USERS = data;
        console.log("retrieved user data");
    }).done(function() {
        USERS_BY_ID = createHashmapById(USERS);
        var ledgerTable = $('#ledgerTable').DataTable({
            paging: false,
            info: false,
            searching: false});
    
        var userName = USERS_BY_ID[userId].firstName + ' '+  USERS_BY_ID[userId].lastName;
    
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
                var dateAssigned = changeDateString(currentTransaction.dateAssigned);
                var dateEarned = changeDateString(currentTransaction.dateEarned);
                var newRow = [amount, reason, receiver, assigner, dateEarned, dateAssigned];
                $('#ledgerTable').DataTable().row.add(newRow);
            }
            $('#ledgerTable').DataTable().draw();
            $("#loadingIcon").hide();
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
                var dateAssigned = changeDateString(currentTransaction.dateAssigned);
                var dateEarned = changeDateString(currentTransaction.dateEarned);
                var newRow = [amount, reason, receiver, assigner, dateEarned, dateAssigned];
                $('#ledgerTable').DataTable().row.add(newRow); 
            }
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
                var dateAssigned = changeDateString(currentTransaction.dateAssigned);
                var dateEarned = changeDateString(currentTransaction.dateEarned);
                var newRow = [amount, reason, receiver, assigner, dateEarned, dateAssigned];
                if (assigner == userName) {
                    $('#ledgerTable').DataTable().row.add(newRow); 
                }
            }
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
                var dateAssigned = changeDateString(currentTransaction.dateAssigned);
                var dateEarned = changeDateString(currentTransaction.dateEarned);
                var newRow = [amount, reason, receiver, assigner, dateEarned, dateAssigned];
                if (receiver == userName) {
                    $('#ledgerTable').DataTable().row.add(newRow); 
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
