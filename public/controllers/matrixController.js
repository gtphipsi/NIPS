var USER;
var USERS;
var USERS_BY_ID;
var COMMITTEES;
var COMMITTEES_BY_ID;
var ALL_USER_IDS = [];
var TRANSACTIONS;
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

    hideFilters();

    createNavBar();

    $.get("/users", function(data) {
        USERS = data;
        console.log("retrieved user data");
    }).done(function() {
        USERS_BY_ID = createHashmapById(USERS);
    
        var userId = sessionStorage.getItem('userId');
        var userName = USERS_BY_ID[userId].firstName + ' '+  USERS_BY_ID[userId].lastName;
        console.log(userId);
    
        var userURL = '/ledger/' + userId;
        $.get(userURL, function(data) {
            TRANSACTIONS = data;
            console.log("retrieved transaction data");
        }).done(function() {
            
        });

        /* Show Buttons */

        $('#showGPButton').off('click');
        $('#showGPButton').click(function() {
            if (FILTERS.indexOf(positions.GP) >= 0) {
                return;
            }
            FILTERS.push(positions.GP);
            $('#hideGPButton').show();
        });

        $('#showVGPButton').off('click');
        $('#showVGPButton').click(function() {
            if (FILTERS.indexOf(positions.VGP) >= 0) {
                return;
            }
            FILTERS.push(positions.VGP);
            $('#hideVGPButton').show();
        });

        $('#showPButton').off('click');
        $('#showPButton').click(function() {
            if (FILTERS.indexOf(positions.P) >= 0) {
                return;
            }
            FILTERS.push(positions.P);
            $('#hidePButton').show();
        });

        $('#showNMEButton').off('click');
        $('#showNMEButton').click(function() {
            if (FILTERS.indexOf(positions.NME) >= 0) {
                return;
            }
            FILTERS.push(positions.NME);
            $('#hideNMEButton').show();
        });

        $('#showBGButton').off('click');
        $('#showBGButton').click(function() {
            if (FILTERS.indexOf(positions.BG) >= 0) {
                return;
            }
            FILTERS.push(positions.BG);
            $('#hideBGButton').show();
        });

        $('#showSGButton').off('click');
        $('#showSGButton').click(function() {
            if (FILTERS.indexOf(positions.SG) >= 0) {
                return;
            }
            FILTERS.push(positions.SG);
            $('#hideSGButton').show();
        });

        $('#showAGButton').off('click');
        $('#showAGButton').click(function() {
            if (FILTERS.indexOf(positions.AG) >= 0) {
                return;
            }
            FILTERS.push(positions.AG);
            $('#hideAGButton').show();
        });

        $('#showPhuButton').off('click');
        $('#showPhuButton').click(function() {
            if (FILTERS.indexOf(positions.PHU) >= 0) {
                return;
            }
            FILTERS.push(positions.PHU);
            $('#hidePhuButton').show();
        });

        $('#showHiButton').off('click');
        $('#showHiButton').click(function() {
            if (FILTERS.indexOf(positions.HI) >= 0) {
                return;
            }
            FILTERS.push(positions.HI);
            $('#hideHiButton').show();
        });

        $('#showCommitteeButton').off('click');
        $('#showCommitteeButton').click(function() {
            if (FILTERS.indexOf(positions.COMMITTEE) >= 0) {
                return;
            }
            FILTERS.push(positions.COMMITTEE);
            $('#hideCommitteeButton').show();
        });

        /* Hide Buttons */

        $('#hideGPButton').off('click');
        $('#hideGPButton').click(function() {
            console.log('CLICKED');
            if (FILTERS.indexOf(positions.GP) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.GP), 1);
            }
            console.log(FILTERS);
            $('#hideGPButton').hide();
        });

        $('#hideVGPButton').off('click');
        $('#hideVGPButton').click(function() {
            if (FILTERS.indexOf(positions.VGP) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.VGP), 1);
                console.log(FILTERS);
                $('#hideVGPButton').hide();
            }
        });

        $('#hidePButton').off('click');
        $('#hidePButton').click(function() {
            if (FILTERS.indexOf(positions.P) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.P), 1);
                console.log(FILTERS);
                $('#hidePButton').hide();
            }
        });

        $('#hideNMEButton').off('click');
        $('#hideNMEButton').click(function() {
            if (FILTERS.indexOf(positions.NME) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.NME), 1);
                console.log(FILTERS);
                $('#hideNMEButton').hide();
            }
        });

        $('#hideBGButton').off('click');
        $('#hideBGButton').click(function() {
            if (FILTERS.indexOf(positions.BG) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.BG), 1);
                console.log(FILTERS);
                $('#hideBGButton').hide();
            }
        });

        $('#hideSGButton').off('click');
        $('#hideSGButton').click(function() {
            if (FILTERS.indexOf(positions.SG) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.SG), 1);
                console.log(FILTERS);
                $('#hideSGButton').hide();
            }
        });

        $('#hideAGButton').off('click');
        $('#hideAGButton').click(function() {
            if (FILTERS.indexOf(positions.AG) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.AG), 1);
                console.log(FILTERS);
                $('#hideAGButton').hide();
            }
        });

        $('#hidePhuButton').off('click');
        $('#hidePhuButton').click(function() {
            if (FILTERS.indexOf(positions.PHU) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.PHU), 1);
                console.log(FILTERS);
                $('#hidePhuButton').hide();
            }
        });

        $('#hideHiButton').off('click');
        $('#hideHiButton').click(function() {
            if (FILTERS.indexOf(positions.HI) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.HI), 1);
                console.log(FILTERS);
                $('#hideHiButton').hide();
            }
        });

        $('#hideCommitteeButton').off('click');
        $('#hideCommitteeButton').click(function() {
            if (FILTERS.indexOf(positions.COMMITTEE) >= 0) {
                console.log('removing');
                FILTERS.splice(FILTERS.indexOf(positions.COMMITTEE), 1);
                console.log(FILTERS);
                $('#hideCommitteeButton').hide();
            }
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
}

function addFilter(position) {
    switch (position) {
        case positions.GP:
            return "<button class='filterHideButton' id='hideGPButton'>GP</button>";
        case positions.VGP:
            return "<button class='filterHideButton' id='hideVGPButton'>VGP</button>";
        case positions.P:
            return "<button class='filterHideButton' id='hidePButton'>P</button>";
        case positions.NME:
            return "<button class='filterHideButton' id='hideNMEButton'>NME</button>";    
        case positions.BG:
            return "<button class='filterHideButton' id='hideBGButton'>BG</button>";
        case positions.SG:
            return "<button class='filterHideButton' id='hideSGButton'>SG</button>";
        case positions.AG:
            return "<button class='filterHideButton' id='hideAGButton'>AG</button>";
        case positions.PHU:
            return "<button class='filterHideButton' id='hidePhuButton'>Phu</button>";
        case positions.HI:
            return "<button class='filterHideButton' id='hideHiButton'>Hi</button>";
        case positions.COMMITTEE:
            return "<button class='filterHideButton' id='hideCommitteeButton'>Committee</button>";
        default:
            return '';
    }
}