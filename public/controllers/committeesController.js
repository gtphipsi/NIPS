var USER;
var USERS;
var USERS_BY_ID;
var COMMITTEES;
var COMMITTEES_BY_ID;

$(document).ready(function() {
    console.log("Loading committees page...");

    createNavBar('committees');

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
    $.get(userURL, function(data) {
        USER = data;
        console.log("retrieved one user data");
        console.log(data);
    }).fail(function() {
        alert("failed retrieving user data--returning to login page");
        window.location = '/';
    }).done(function() {
        $.get("/users", function(data) {
            USERS = data;
            console.log("retrieved all user data");
        }).done(function() {
            USERS_BY_ID = createHashmapById(USERS);
            $.get("/committees", function(data) {
                COMMITTEES = data;
                COMMITTEES_BY_ID = createHashmapById(data);
                console.log("retrieved committee data");
            }).done(function() {
                $('#committeesContainer').html('');
                for (let committeeId in COMMITTEES_BY_ID) {
                    var committee = COMMITTEES_BY_ID[committeeId];
                    if (committee.committee != "All Brothers" && committee.committee != "New Members") {
                        createCommitteeCard(committeeId);
                    }
                }
                $("#loadingIcon").html('');
            });
        });
    });
});


function createCommitteeCard(committeeId) {
    var committee = COMMITTEES_BY_ID[committeeId];
    var newCard = 
    "<div class='row committeeRow'>" +
    "<div class='committeeCard boxShadow'>";
    var icon = getCommitteeIcon(committeeId);
    var name = `<h1 class="committeeName">${icon} ${committee.committee}</h1>`;
    var headUser = USERS_BY_ID[committee.head];
    var head = `<h1><i class="fas fa-user-cog"></i> Head: ${headUser.firstName} ${headUser.lastName}</h1>`;
    var members = '<h1><i class="fas fa-user-friends"></i> Members</h1>' + getMembersList(committee.members);
    var meetings = `<h1><i class="far fa-calendar-check"></i> Meetings: ${committee.meetings}</h1>`;
    var budget = `<h1><i class="fas fa-dollar-sign"></i> Budget: $${committee.budget}</h1>`;

    newCard += name;
    newCard += head;
    newCard += members;
    newCard += meetings;
    newCard += budget;
    newCard += "</div></div>";
    $('#committeesContainer').append(newCard);
}

function getCommitteeIcon(committeeId) {
    var committee = COMMITTEES_BY_ID[committeeId];
    var icon = '<i class="fas fa-briefcase"></i>';
    switch(committee.committee) {
        case "Technology":
            icon = '<i class="fas fa-laptop-code"></i>';
            break;
        case "Membership":
            icon = '<i class="fas fa-calendar-alt"></i>';
            break;
        case "Finance":
            icon = '<i class="fas fa-money-check-alt"></i>';
            break;
        case "Social":
            icon = '<i class="far fa-laugh"></i>';
            break;
        case "Scholarship":
            icon = '<i class="fas fa-university"></i>';
            break;
        case "Philanthropy":
            icon = '<i class="fas fa-donate"></i>';
            break;
        case "APR":
            icon = '<i class="fas fa-graduation-cap"></i>';
            break;
        case "Health and Wellness":
            icon = '<i class="fas fa-dumbbell"></i>';
            break;
        default:
            icon = '<i class="fas fa-briefcase"></i>';
            break;
    }
    return icon;
}

function getMembersList(members) {
    var membersList = "<ul>";
    for (let m = 0; m < members.length; m++) {
        var memberId = members[m];
        var user = USERS_BY_ID[memberId];
        membersList += `<li>${user.firstName} ${user.lastName}</li>`;
    }
    membersList += "</ul>";
    return membersList;
}