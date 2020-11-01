function createHashmapById(data) {
    if (!data || !data.length || data.length == 0) {
        console.log("hashmap data is erroneous/empty");
        return {};
    }
    var hashmap = {};
    for (var i = 0; i < data.length; i++) {
        var id = data[i]._id;
        hashmap[id] = data[i];
    }
    return hashmap;
}


function getPositions(user) {
    var positions = [];
    if (!user || !user.officerPositions || !user.committeePositions) {
        return [];
    }
    for (o in user.officerPositions) {
        if (user.officerPositions[o]) {
            positions.push(o);
        }
    }
    for (c in user.committeePositions) {
        if (user.committeePositions[c]) {
            positions.push(c + ' Head');
        }
    }
    return positions;
}