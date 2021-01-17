var USER_OFFICER_POSITIONS = []; // list of officer position names
var EDIT_USER_OFFICER_POSITIONS = []; // list of officer position names for editing user
var USERS; // all user documents via GET request
var USERS_BY_ID; // hashmap of users by id
var COMMITTEE_MEMBERS = []; // list of user ids
var COMMITTEES; // all committee documents via GET request
var EDIT_COMMITTEE_MEMBERS = []; // list of members in edited committee
var MEMBER_SELECTED = ''; // variable to track current selection in adding members box

$(document).ready(function() {
    console.log("Loading admin page...");

    createNavBar('admin');
    
    $('#signoutButton').off('click');
    $('#signoutButton').click(function() {
        alert('clicked');
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

    $.get("/users", function(data) {
        USERS = data;
        console.log("retrieved user data");
    }).done(function() {
        for (var i = 0; i < USERS.length; i++) {
            $('#committeeMembers').append(`<option value=${USERS[i]._id}>${USERS[i].firstName} ${USERS[i].lastName}</option>`);
            $('#editMembers').append(`<option value=${USERS[i]._id}>${USERS[i].firstName} ${USERS[i].lastName}</option>`);
            $('#committeeHead').append(`<option value=${USERS[i]._id}>${USERS[i].firstName} ${USERS[i].lastName}</option>`);
            $('#editCommitteeHead').append(`<option value=${USERS[i]._id}>${USERS[i].firstName} ${USERS[i].lastName}</option>`);
            $('#editCommitteeMembers').append(`<option value=${USERS[i]._id}>${USERS[i].firstName} ${USERS[i].lastName}</option>`);
        }
        USERS_BY_ID = createHashmapById(USERS);
        $.get('/committees', function(data) {
            COMMITTEES = data;
            console.log("retrieved committee data");
        }).done(function() {
            for (var i = 0; i < COMMITTEES.length; i++) {
                if (COMMITTEES[i].committee != 'All Brothers' && COMMITTEES[i].committee != 'New Members') {
                    $('#editCommittees').append(`<option value=${COMMITTEES[i]._id}>${COMMITTEES[i].committee}</option>`);
                }
            }
            COMMITTEES_BY_ID = createHashmapById(COMMITTEES);
            $("#loadingIcon").hide();
        });
    });

    var addOfficerPositionButton = $('#addOfficerPositionButton');
    var officerPositions = $('#officerPositions');
    var officerPositionsAdded = $('#officerPositionsAdded');

    var submitUserButton = $('#submitUserButton');
    var submitEditUserButton = $('#submitEditUserButton');

    addOfficerPositionButton.off('click');
    addOfficerPositionButton.click(function() {
        var position = officerPositions.val();
        console.log(position);
        var index = USER_OFFICER_POSITIONS.indexOf(position);
        if (index < 0) {
            USER_OFFICER_POSITIONS.push(position);
            officerPositionsAdded.append(`<li id=${position}><i class="fas fa-caret-right"></i> ${officerPositions.val()} <button class='deleteButton' ` +
            `type='button' onclick='deleteOfficerPosition(${position})'><i class='far fa-window-close fontgrey'></i></button></li>`);
        } else {
            console.log("Position already added");
        }
    });

    var editOfficerPositions = $('#editOfficerPositions');
    var editOfficerPositionButton = $('#editOfficerPositionButton');
    var editOfficerPositionsAdded = $('#editOfficerPositionsAdded');

    editOfficerPositionButton.off('click');
    editOfficerPositionButton.click(function() {
        var position = editOfficerPositions.val();
        var positionLabel = position;
        if (position == 'rushChair') {
            positionLabel = 'Rush Chair';
        } else if (position == 'riskManager') {
            positionLabel = 'Risk Manager';
        }
        console.log(position);
        console.log(positionLabel);
        var index = EDIT_USER_OFFICER_POSITIONS.indexOf(position);
        if (index < 0) {
            EDIT_USER_OFFICER_POSITIONS.push(position);
            editOfficerPositionsAdded.append(`<li id=edit${position}><i class="fas fa-caret-right"></i> ${positionLabel} <button class='deleteButton' ` +
            `type='button' onclick='deleteEditOfficerPosition(edit${position})'><i class='far fa-window-close fontgrey'></i></button></li>`);
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
        var postData = {'newUser':newUser, 'USER':USERS_BY_ID[userId]}
        $.post("/users", postData).done(function() {
            console.log("User successfully added");
            console.log(newUser);
            alert('New User Added to Database');
            location.reload();
        }).fail( function() {
            alert('Access Denied');
        });
    });

    submitEditUserButton.off('click');
    submitEditUserButton.click(function() {
        var firstName = $('#editUserFirstName').val();
        var lastName = $('#editUserLastName').val();
        var badgeNumber = $('#editUserBadgeNumber').val();
        var isAdmin = $('#editUserAdmin').prop('checked');
        var updateUser = {
            firstName: firstName,
            lastName: lastName,
            badgeNumber: badgeNumber,
            admin: JSON.parse(isAdmin),
            officerPositions: officerPositionsToBoolean(EDIT_USER_OFFICER_POSITIONS)
        }
        var put_url = "/users/" + $('#editMembers').val();
        console.log('making PUT request at', put_url);
        $.ajax({
            url: put_url,
            type: 'PUT',
            data: updateUser,
            success: function(response) {
            console.log("User successfully updated");
            console.log(updateUser);
            alert('User Updated in Database');
            location.reload();
            }
        });
    });

    var addCommitteeMemberButton = $('#addCommitteeMemberButton');
    var editCommitteeMemberButton = $('#editCommitteeMemberButton');
    var committeeMembers = $('#committeeMembers');
    var committeeMembersAdded = $('#committeeMembersAdded');
    var editCommitteeMembersAdded = $('#editCommitteeMembersAdded');

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

    editCommitteeMemberButton.off('click');
    editCommitteeMemberButton.click(function() {
        var id = $('#editCommitteeMembers').val();
        var member = USERS_BY_ID[id];
        var name = `${member.firstName} ${member.lastName}`;
        var index = EDIT_COMMITTEE_MEMBERS.indexOf(id);
        if (index < 0) {
            EDIT_COMMITTEE_MEMBERS.push(id);
            editCommitteeMembersAdded.append(`<li id=edit${id}><i class="fas fa-caret-right"></i> ${name} <button class='deleteButton' ` +
            `type='button' onclick='deleteEditCommitteeMember(edit${id})'><i class='far fa-window-close fontgrey'></i></button></li>`);
        } else {
            console.log("Member already added");
        }
    });

    $('#submitCommitteeButton').off('click');
    $('#submitCommitteeButton').click(function() {
        var newCommittee = {
            committee: $('#addCommitteeName').val(),
            members: COMMITTEE_MEMBERS,
            head: $('#committeeHead').val(),
            meetings: $('#addCommitteeMeeting').val(),
            budget: $('#addCommitteeBudget').val()
        }
        var postData = {'newCommittee':newCommittee, 'USER':USERS_BY_ID[userId]}
        $.post("/committees", postData).done(function() {
            console.log("Committee successfully added");
            console.log(newCommittee);
            alert('New Committee Added to Database');
            location.reload();
        }).fail( function() {
            alert('Access Denied');
        });;
    });

    $('#editCommittees').change(function() {
        // clear form
        $('#editCommitteeMeeting').val('');
        $('#editCommitteeBudget').val('');
        $('#editCommitteeHead').val('None');

        // clear members
        EDIT_COMMITTEE_MEMBERS = [];
        $('#editCommitteeMembersAdded').html('');

        if ($('#editCommittees').val() == 'None') {
            return;
        }
    
        // populate form
        var id = $('#editCommittees').val();
        var committee = COMMITTEES_BY_ID[id];
        $('#editCommitteeMeeting').val(`${committee.meetings}`);
        $('#editCommitteeBudget').val(`${committee.budget}`);
        $('#editCommitteeHead').val(committee.head);

        // populate members
        for (i in committee.members) {
            var id = committee.members[i];
            var user = USERS_BY_ID[id];
            EDIT_COMMITTEE_MEMBERS.push(id);
            var name = `${user.firstName} ${user.lastName}`;
            $('#editCommitteeMembersAdded').append(`<li id=edit${id}><i class="fas fa-caret-right"></i> ${name} <button class='deleteButton' ` +
            `type='button' onclick='deleteEditCommitteeMember(edit${id})'><i class='far fa-window-close fontgrey'></i></button></li>`);
        }
    });

    $('#submitEditCommitteeButton').off('click');
    $('#submitEditCommitteeButton').click(function() {
        var updateCommittee = {
            members: EDIT_COMMITTEE_MEMBERS,
            head: $('#editCommitteeHead').val(),
            meetings: $('#editCommitteeMeeting').val(),
            budget: $('#editCommitteeBudget').val()
        }
        var put_url = '/committees/' + $('#editCommittees').val();
        console.log('editing committee at', put_url);
        $.ajax({
            url: put_url,
            type: 'PUT',
            data: updateCommittee,
            success: function(response) {
            console.log("Committee successfully updated");
            console.log(updateCommittee);
            alert('Committee Updated in Database');
            location.reload();
            }
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


function deleteEditOfficerPosition(position) {
    var id = `#${position.id}`;
    $(id).remove();
    console.log(id);
    var officerPosition = id.substring(5, id.length);
    console.log(officerPosition);
    var index = EDIT_USER_OFFICER_POSITIONS.indexOf(officerPosition);
    if (index >= 0) {
        EDIT_USER_OFFICER_POSITIONS.splice(index, 1);
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


function deleteEditCommitteeMember(select_id) {
    console.log("DELETING EDIT COMMITTEE MEMBER");
    console.log(select_id);
    $(select_id).remove();
    var member_id = select_id.id.slice(4);
    console.log(member_id);
    var index = EDIT_COMMITTEE_MEMBERS.indexOf(member_id);
    if (index >= 0) {
        EDIT_COMMITTEE_MEMBERS.splice(index, 1);
        console.log(EDIT_COMMITTEE_MEMBERS);
    } else {
        console.log('not found');
        console.log(member_id);
        console.log(EDIT_COMMITTEE_MEMBERS);
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
        Phu: false,
        riskManager: false,
        rushChair: false
    }
    for (var i = 0; i < positions.length; i++) {
        var position = positions[i];
        booleanPositions[position] = true;
    }
    return booleanPositions;
}


function updateEditUser() {
    // clear form
    $('#editUserFirstName').val('');
    $('#editUserLastName').val('');
    $('#editUserBadgeNumber').val('');
    $('#editUserAdmin').prop('checked', false);

    // clear officer positions
    EDIT_USER_OFFICER_POSITIONS = [];
    $('#editOfficerPositionsAdded').html('');

    if ($('#editMembers').val() == 'None') {
        return;
    }

    // populate form
    var id = $('#editMembers').val();
    console.log('editing', id);
    var user = USERS_BY_ID[id];
    $('#editUserFirstName').val(`${user.firstName}`);
    $('#editUserLastName').val(`${user.lastName}`);
    $('#editUserBadgeNumber').val(`${user.badgeNumber}`);
    if (user.admin) {
        $('#editUserAdmin').prop('checked', true);
    }

    // populate officer positions
    var keys = Object.keys(user.officerPositions);
    for (k in keys) {
        var position = keys[k];
        if (user.officerPositions[position]) {
            EDIT_USER_OFFICER_POSITIONS.push(position);
            var positionLabel = position;
            if (position == 'rushChair') {
                positionLabel = 'Rush Chair';
            } else if (position == 'riskManager') {
                positionLabel = 'Risk Manager';
            }
            console.log(position);
            console.log(positionLabel);
            $('#editOfficerPositionsAdded').append(`<li id=edit${position}><i class="fas fa-caret-right"></i> ${positionLabel} <button class='deleteButton' ` +
            `type='button' onclick='deleteEditOfficerPosition(edit${position})'><i class='far fa-window-close fontgrey'></i></button></li>`);
        }
    }
}
