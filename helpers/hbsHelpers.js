const hbsHelpers = {
    json: function (context) {
        return JSON.stringify(context);
    },
    range: function (start, end) {
        const result = [];
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    },
    eq: function (a, b) {
        return a === b;
    },
    subtract: function (a, b) {
        return a - b;
    },
    log: function (m) {
        console.log(m);
    },
    removeExtension: function (filename) {
        return filename ? filename.replace(/\.[^/.]+$/, '') : '';
    },
    upperCase: function (str) {
        return str ? str.toUpperCase() : '';
    },
    toFixed: function(number, digits) {
        return number.toFixed(digits);
    },
    gt: function (a, b) {
        return a > b;
    }
};

module.exports = hbsHelpers;

