document.addEventListener("DOMContentLoaded", function (event) {
    var positioning = [];
    getLocation();
    console.log("pass");
});

//seeks geolocation permission from user
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Enable geolocation in order to make app work!");
    }
}

//shows user position and stores it
function showPosition(position) {
    alert("Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude);
}

//handles geolocation errors
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Enable geolocation in order to make app work!");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}