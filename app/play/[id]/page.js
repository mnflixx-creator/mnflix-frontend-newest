// page.js

// Assume we have access to a function to check user authentication
authCheck();

function playVideo(user) {
    if (user.isAuthenticated) {
        // Allow playback without strict subscription validation
        startPlayback();
    } else {
        // Show an error if user is not authenticated
        showSubscriptionError();
    }
}

function checkSubscription(user) {
    if (user.isAuthenticated) {
        // Optionally show subscription message or just allow playback
        return true;
    } else {
        return false;
    }
}