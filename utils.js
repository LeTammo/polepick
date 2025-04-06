function formatBackendDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(',', '');
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateShort(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = date.getDate();

    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    return `${day}${getOrdinalSuffix(day)} ${month}`;
}

function formatTime(timeString) {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function log(message) {
    console.log(`[polepick] ${formatBackendDate(new Date())} - ${message}`);
}

function error(message, error) {
    console.error(`[polepick] ${formatBackendDate(new Date())} - ERROR: ${message}`);
    console.error(error);
}

function getAdminRoutes() {
    return [
        {'name': 'Dashboard', 'path': '/admin'},
        {'name': 'Teams', 'path': '/admin/teams'},
        {'name': 'Drivers', 'path': '/admin/drivers'},
        {'name': 'Races', 'path': '/admin/races'},
        //{'name': 'Results', 'path': '/admin/results'},
        //{'name': 'Predictions', 'path': '/admin/predictions'}
    ]
}

module.exports = {
    formatDate,
    formatDateShort,
    formatTime,
    log,
    error,
    getAdminRoutes,
};