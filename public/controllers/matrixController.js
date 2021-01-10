var USER;
var USERS;
var USERS_BY_ID;
var COMMITTEES;
var COMMITTEES_BY_ID;
var ALL_USER_IDS = [];
var TRANSACTIONS;
var MATRIX;
var FILTERS = [];
var assigner = "";
var reason = "";
var amount = 0;
var currentGroup;
var currentBrother;
var groups = [];
var log = [];

$(document).ready(function() {
    console.log("Loading assign page...");

    var userId = sessionStorage.getItem('userId');
    console.log(userId);
    checkLoggedIn(userId);
    createNavBar('matrix');

    hideFilters();
    
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

    var matrixTable = $('#matrixTable').DataTable({
        paging: false,
        info: false,
        searching: false,
        fixedColumns: true,
        autoWidth: false,
        "columnDefs": [
        {
            "targets": -1,
            "visible": false
        }]
    });

    $.get("/users", function(data) {
        USERS = data;
        console.log("retrieved user data");
    }).done(function() {
        USERS_BY_ID = createHashmapById(USERS);
    
        var userURL = '/ledger/' + userId;
        $.get(userURL, function(data) {
            TRANSACTIONS = data;
            console.log("retrieved transaction data");
        }).done(function() {
            $.get("/matrixItems", function(data) {
                MATRIX = data;
                console.log("retrieved matrix data");
            }).done(function() {
                console.log("updating matrix table");
                $('#matrixTable').DataTable().clear().draw();
                for (var i = 0; i < MATRIX.length; i++) {
                    var currentMatrix = MATRIX[i];
                    console.log(currentMatrix);
                    var newRow = [currentMatrix.title, currentMatrix.positivePoints, currentMatrix.negativePoints, currentMatrix.assigner, currentMatrix.tag];
                    $('#matrixTable').DataTable().row.add(newRow);
                }
                $('#matrixTable').DataTable().draw();
                $('#matrixTable').DataTable().columns.adjust().draw();
                $("#loadingIcon").hide();
            });
        });

        /* Show Buttons */

        $('#showGPButton').off('click');
        $('#showGPButton').click(function() {
            if (FILTERS.indexOf(positions.GP) >= 0) {
                return;
            }
            FILTERS.push(positions.GP);
            $('#hideGPButton').show();
            updateMatrix();
        });

        $('#showVGPButton').off('click');
        $('#showVGPButton').click(function() {
            if (FILTERS.indexOf(positions.VGP) >= 0) {
                return;
            }
            FILTERS.push(positions.VGP);
            $('#hideVGPButton').show();
            updateMatrix();
        });

        $('#showPButton').off('click');
        $('#showPButton').click(function() {
            if (FILTERS.indexOf(positions.P) >= 0) {
                return;
            }
            FILTERS.push(positions.P);
            $('#hidePButton').show();
            updateMatrix();
        });

        $('#showNMEButton').off('click');
        $('#showNMEButton').click(function() {
            if (FILTERS.indexOf(positions.NME) >= 0) {
                return;
            }
            FILTERS.push(positions.NME);
            $('#hideNMEButton').show();
            updateMatrix();
        });

        $('#showBGButton').off('click');
        $('#showBGButton').click(function() {
            if (FILTERS.indexOf(positions.BG) >= 0) {
                return;
            }
            FILTERS.push(positions.BG);
            $('#hideBGButton').show();
            updateMatrix();
        });

        $('#showSGButton').off('click');
        $('#showSGButton').click(function() {
            if (FILTERS.indexOf(positions.SG) >= 0) {
                return;
            }
            FILTERS.push(positions.SG);
            $('#hideSGButton').show();
            updateMatrix();
        });

        $('#showAGButton').off('click');
        $('#showAGButton').click(function() {
            if (FILTERS.indexOf(positions.AG) >= 0) {
                return;
            }
            FILTERS.push(positions.AG);
            $('#hideAGButton').show();
            updateMatrix();
        });

        $('#showPhuButton').off('click');
        $('#showPhuButton').click(function() {
            if (FILTERS.indexOf(positions.PHU) >= 0) {
                return;
            }
            FILTERS.push(positions.PHU);
            $('#hidePhuButton').show();
            updateMatrix();
        });

        $('#showHiButton').off('click');
        $('#showHiButton').click(function() {
            if (FILTERS.indexOf(positions.HI) >= 0) {
                return;
            }
            FILTERS.push(positions.HI);
            $('#hideHiButton').show();
            updateMatrix();
        });

        $('#showCommitteeButton').off('click');
        $('#showCommitteeButton').click(function() {
            if (FILTERS.indexOf(positions.COMMITTEE) >= 0) {
                return;
            }
            FILTERS.push(positions.COMMITTEE);
            $('#hideCommitteeButton').show();
            updateMatrix();
        });

        $('#showRiskManagerButton').off('click');
        $('#showRiskManagerButton').click(function() {
            if (FILTERS.indexOf(positions.RISK_MANAGER) >= 0) {
                return;
            }
            FILTERS.push(positions.RISK_MANAGER);
            $('#hideRiskManagerButton').show();
            updateMatrix();
        });

        $('#showRushChairButton').off('click');
        $('#showRushChairButton').click(function() {
            if (FILTERS.indexOf(positions.RUSH_CHAIR) >= 0) {
                return;
            }
            FILTERS.push(positions.RUSH_CHAIR);
            $('#hideRushChairButton').show();
            updateMatrix();
        });

        /* Hide Buttons */

        $('#hideGPButton').off('click');
        $('#hideGPButton').click(function() {
            console.log('CLICKED');
            if (FILTERS.indexOf(positions.GP) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.GP), 1);
                $('#hideGPButton').hide();
                updateMatrix();
            }
        });

        $('#hideVGPButton').off('click');
        $('#hideVGPButton').click(function() {
            if (FILTERS.indexOf(positions.VGP) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.VGP), 1);
                $('#hideVGPButton').hide();
                updateMatrix();
            }
        });

        $('#hidePButton').off('click');
        $('#hidePButton').click(function() {
            if (FILTERS.indexOf(positions.P) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.P), 1);
                console.log(FILTERS);
                $('#hidePButton').hide();
                updateMatrix();
            }
        });

        $('#hideNMEButton').off('click');
        $('#hideNMEButton').click(function() {
            if (FILTERS.indexOf(positions.NME) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.NME), 1);
                $('#hideNMEButton').hide();
                updateMatrix();
            }
        });

        $('#hideBGButton').off('click');
        $('#hideBGButton').click(function() {
            if (FILTERS.indexOf(positions.BG) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.BG), 1);
                $('#hideBGButton').hide();
                updateMatrix();
            }
        });

        $('#hideSGButton').off('click');
        $('#hideSGButton').click(function() {
            if (FILTERS.indexOf(positions.SG) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.SG), 1);
                $('#hideSGButton').hide();
                updateMatrix();
            }
        });

        $('#hideAGButton').off('click');
        $('#hideAGButton').click(function() {
            if (FILTERS.indexOf(positions.AG) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.AG), 1);
                $('#hideAGButton').hide();
                updateMatrix();
            }
        });

        $('#hidePhuButton').off('click');
        $('#hidePhuButton').click(function() {
            if (FILTERS.indexOf(positions.PHU) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.PHU), 1);
                $('#hidePhuButton').hide();
                updateMatrix();
            }
        });

        $('#hideHiButton').off('click');
        $('#hideHiButton').click(function() {
            if (FILTERS.indexOf(positions.HI) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.HI), 1);
                $('#hideHiButton').hide();
                updateMatrix();
            }
        });

        $('#hideCommitteeButton').off('click');
        $('#hideCommitteeButton').click(function() {
            if (FILTERS.indexOf(positions.COMMITTEE) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.COMMITTEE), 1);
                $('#hideCommitteeButton').hide();
                updateMatrix();
            }
        });

        $('#hideRiskManagerButton').off('click');
        $('#hideRiskManagerButton').click(function() {
            if (FILTERS.indexOf(positions.RISK_MANAGER) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.RISK_MANAGER), 1);
                $('#hideRiskManagerButton').hide();
                updateMatrix();
            }
        });

        $('#hideRushChairButton').off('click');
        $('#hideRushChairButton').click(function() {
            if (FILTERS.indexOf(positions.RUSH_CHAIR) >= 0) {
                FILTERS.splice(FILTERS.indexOf(positions.RUSH_CHAIR), 1);
                $('#hideRushChairButton').hide();
                updateMatrix();
            }
        });
    });
    var matrixSearchInput = $('#matrixSearchInput');
        matrixSearchInput.keyup(function() {
            console.log("Searching");
            var input, filter, table, tr, td, i, txtValue;
            input = document.getElementById("matrixSearchInput");
            filter = input.value.toUpperCase();
            table = document.getElementById("matrixTable");
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

function changeDateString(rawDate) {
    return rawDate.slice(5,7)+'/'+rawDate.slice(8,10)+'/'+rawDate.slice(0,4)
}

function hideFilters() {
    $('#hideGPButton').hide();
    $('#hideVGPButton').hide();
    $('#hidePButton').hide();
    $('#hideNMEButton').hide();
    $('#hideBGButton').hide();
    $('#hideSGButton').hide();
    $('#hideAGButton').hide();
    $('#hidePhuButton').hide();
    $('#hideHiButton').hide();
    $('#hideCommitteeButton').hide();
    $('#hideRiskManagerButton').hide();
    $('#hideRushChairButton').hide();
}

function updateMatrix() {
    $('#matrixTable').DataTable().clear().draw();
    for (var i = 0; i < MATRIX.length; i++) {
        var currentMatrix = MATRIX[i];
        var filterTag = currentMatrix.tag;
        var newRow = [currentMatrix.title, currentMatrix.positivePoints, currentMatrix.negativePoints, currentMatrix.assigner, currentMatrix.tag];
        if (FILTERS.length == 0 || FILTERS.indexOf(filterTag) >= 0) {
            $('#matrixTable').DataTable().row.add(newRow);
        }
    }
    $('#matrixTable').DataTable().draw();
    $('#matrixTable').DataTable().columns.adjust().draw();
}
