const formatDays = (M, T, W, R, F) => {
    if (R) {
        R = 'R';
    }

    return M + T + W + R + F;
};

const formatTime = (unformattedTime) => {
    if (unformattedTime === "ARR") {
        return ({ start_hour: null, start_min: null, end_hour: null, end_min: null });
    }

    let start = unformattedTime.substr(0, unformattedTime.indexOf('-'));
    let end = unformattedTime.split(/[- ABCDEFGHIJKLMNOPQRSTUVWXYZ]/)[1];
    let ampm = unformattedTime.split(/[- 0123456789]/).slice(-1)[0];
    let start_hour = null;
    let start_min = null;
    let end_hour = null;
    let end_min = null;

    if (start.length > 2) {
        if (start.length === 3) {
            start_hour = parseInt(start[0]);
            start_min = parseInt(start[1]+start[2]);
        } else {
            start_hour = parseInt(start[0]+start[1]);
            start_min = parseInt(start[2]+start[3]);
        }
    } else {
        start_hour = parseInt(start);
        start_min = 0;
    }
    if (end.length > 2) {
        if (end.length === 3) {
            end_hour = parseInt(end[0]);
            end_min = parseInt(end[1]+end[2]);
        } else {
            end_hour = parseInt(end[0]+end[1]);
            end_min = parseInt(end[2]+end[3]);
        }
    } else {
        end_hour = parseInt(end);
        end_min = 0;
    }

    if (start_hour >= 8 && start_hour <= 12 && end_hour > 0 && end_hour <= 9 && ampm === "PM") {
        end_hour += 12;
    } if (start_hour > 0 && start_hour <= 8 && ampm === "PM") {
        start_hour += 12;
        end_hour += 12;
    }

    return ({ start_hour, start_min, end_hour, end_min });
}

const createRow = (row) => {
    if (row.Session !== 'Regular Academic Session') {
        return false;
    }

    let rowVals = [];

    const { start_hour, start_min, end_hour, end_min } = formatTime(row['Time']);
    const regExp = /\(([^)]+)\)/;
    const subject = regExp.exec(row['Subject'])[1];

    rowVals.push(parseInt(row['Class Nbr']));
    rowVals.push(subject);
    rowVals.push(parseInt(row['Catalog Nbr']));
    rowVals.push(parseInt(row['Section']));
    rowVals.push(row['Course Title']);
    rowVals.push(row['Component']);
    rowVals.push(formatDays(row['M'], row['T'], row['W'], row['TH'], row['F']));
    rowVals.push(start_hour);
    rowVals.push(start_min);
    rowVals.push(end_hour);
    rowVals.push(end_min);
    rowVals.push(row['Location']);
    rowVals.push(row['Instructor']);
    rowVals.push(parseInt(row['Units']));

    return rowVals;
};

const createString = () => {
    const queryString = 
    'INSERT INTO classes(classnumber, subject, catalognumber, section, ' +
    'coursetitle, component, days, starthour, startmin, endhour, endmin, ' +
    'location, instructor, units) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    return queryString;
};

module.exports = { 
    createRow,
    createString
 };