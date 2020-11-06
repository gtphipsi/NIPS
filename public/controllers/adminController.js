var USER_OFFICER_POSITIONS = [];

$(document).ready(function() {
    console.log("Loading admin page...");

    var addOfficerPositionButton = $('#addOfficerPositionButton');
    var officerPositions = $('#officerPositions');
    var officerPositionsAdded = $('#officerPositionsAdded');

    var submitUserButton = $('#submitUserButton');

    addOfficerPositionButton.off('click');
    addOfficerPositionButton.click(function() {
        console.log("Clicked");
        console.log(officerPositions.val());
        var position = officerPositions.val();
        USER_OFFICER_POSITIONS.push(position);
        officerPositionsAdded.append(`<li id=${position}><i class="fas fa-caret-right"></i> ${officerPositions.val()} <button class='deleteButton' ` +
        `type='button' onclick='deleteOfficerPosition(${position})'><i class='far fa-window-close transparent'></i></button></li>`);
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
        console.log(isAdmin);
        $.post("/users", newUser).done(function() {
            console.log("User successfully added");
            console.log(newUser);
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