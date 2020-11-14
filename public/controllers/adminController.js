var USER_OFFICER_POSITIONS = []; // list of officer position names
var USERS; // all user documents via GET request
var USERS_BY_ID; // hashmap of users by id
var COMMITTEE_MEMBERS = []; // list of user ids
var test = 'test';
var MEMBER_SELECTED = ''; // variable to track current selection in adding members box

$(document).ready(function() {
    console.log("Loading admin page...");

    $.get("/users", function(data) {
        USERS = data;
        console.log("retrieved user data");
    }).done(function() {
        for (var i = 0; i < USERS.length; i++) {
            console.log(`${USERS[i]._id}`);
            $('#committeeMembers').append(`<option value=${USERS[i]._id}>${USERS[i].firstName} ${USERS[i].lastName}</option>`);
            $('#committeeHead').append(`<option value=${USERS[i]._id}>${USERS[i].firstName} ${USERS[i].lastName}</option>`);
        }
        USERS_BY_ID = createHashmapById(USERS);
    });

    var addOfficerPositionButton = $('#addOfficerPositionButton');
    var officerPositions = $('#officerPositions');
    var officerPositionsAdded = $('#officerPositionsAdded');

    var submitUserButton = $('#submitUserButton');

    addOfficerPositionButton.off('click');
    addOfficerPositionButton.click(function() {
        var position = officerPositions.val();
        var index = USER_OFFICER_POSITIONS.indexOf(position);
        if (index < 0) {
            USER_OFFICER_POSITIONS.push(position);
            officerPositionsAdded.append(`<li id=${position}><i class="fas fa-caret-right"></i> ${officerPositions.val()} <button class='deleteButton' ` +
            `type='button' onclick='deleteOfficerPosition(${position})'><i class='far fa-window-close fontgrey'></i></button></li>`);
        } else {
            console.log("Position already added");
        }
    });

    submitUserButton.off('click');
    submitUserButton.click(function() {
        var firstName = $('#addUserFirstName').val();
        var lastName = $('#addUserLastName').val();
        var badgeNumber = $('#addUserBadgeNumber').val();
        var isAdmin = $('#addUserAdmin').prop('checked');
        var newUser = {
            firstName: firstName,
            lastName: lastName,
            badgeNumber: badgeNumber,
            admin: JSON.parse(isAdmin),
            officerPositions: officerPositionsToBoolean(USER_OFFICER_POSITIONS)
        }
        $.post("/users", newUser).done(function() {
            console.log("User successfully added");
            console.log(newUser);
            alert('New User Added to Database');
            location.reload();
        });
    });

    var addCommitteeMemberButton = $('#addCommitteeMemberButton');
    var committeeMembers = $('#committeeMembers');
    var committeeMembersAdded = $('#committeeMembersAdded');

    committeeMembers.change(function() {
        MEMBER_SELECTED = $(this).val();
    });

    addCommitteeMemberButton.off('click');
    addCommitteeMemberButton.click(function() {
        var member = USERS_BY_ID[MEMBER_SELECTED];
        var name = `${member.firstName} ${member.lastName}`;
        var id = `member${MEMBER_SELECTED}`;
        var index = COMMITTEE_MEMBERS.indexOf(MEMBER_SELECTED);
        if (index < 0) {
            COMMITTEE_MEMBERS.push(MEMBER_SELECTED);
            committeeMembersAdded.append(`<li id=${id}><i class="fas fa-caret-right"></i> ${name} <button class='deleteButton' ` +
            `type='button' onclick='deleteCommitteeMember(${id})'><i class='far fa-window-close fontgrey'></i></button></li>`);
        } else {
            console.log("Member already added");
        }
    });

    $('#submitCommitteeButton').off('click');
    $('#submitCommitteeButton').click(function() {
        var newCommittee = {
            committee: $('#addCommitteeName').val(),
            members: COMMITTEE_MEMBERS,
            head: $('#committeeHead').val()
        }
        $.post("/committees", newCommittee).done(function() {
            console.log("Committee successfully added");
            console.log(newCommittee);
            alert('New Committee Added to Database');
            location.reload();
        });
    });
});


function deleteOfficerPosition(position) {
    var id = `#${position.id}`;
    $(id).remove();
    var index = USER_OFFICER_POSITIONS.indexOf(position.id);
    if (index >= 0) {
        USER_OFFICER_POSITIONS.splice(index, 1);
    }
}


function deleteCommitteeMember(select_id) {
    console.log("DELETING COMMITTEE MEMBER");
    console.log(select_id);
    $(select_id).remove();
    var member_id = select_id.id.slice(6);
    console.log(member_id);
    var index = COMMITTEE_MEMBERS.indexOf(member_id);
    if (index >= 0) {
        COMMITTEE_MEMBERS.splice(index, 1);
        console.log(COMMITTEE_MEMBERS);
    }
}


function officerPositionsToBoolean(positions) {
    var booleanPositions = {
        GP: false,
        VGP: false,
        P: false,
        NME: false,
        Hod: false,
        Hi: false,
        AG: false,
        SG: false,
        BG: false,
        Phu: false
    }
    for (var i = 0; i < positions.length; i++) {
        var position = positions[i];
        booleanPositions[position] = true;
    }
    return booleanPositions;
}
