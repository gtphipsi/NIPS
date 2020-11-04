$(document).ready(function() {
    console.log("Loading admin page...");

    var addOfficerPositionButton = $('#addOfficerPositionButton');
    var officerPositions = $('#officerPositions');
    var officerPositionsAdded = $('#officerPositionsAdded');

    addOfficerPositionButton.off('click');
    addOfficerPositionButton.click(function() {
        console.log("Clicked");
        console.log(officerPositions.val());
        officerPositionsAdded.append(`<li><i class="fas fa-caret-right"></i> ${officerPositions.val()} <button class='deleteGroupButton' type='button'><i class='far fa-window-close transparent'></i></button></li>`);
    });
});