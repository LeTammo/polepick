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
    return new Date(dateString).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric'
    });
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

module.exports = {
    formatDate,
    formatDateShort,
    formatTime,
    log,
    error
};