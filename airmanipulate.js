document.addEventListener("DOMContentLoaded", function (event) {

    getLocation(function (latitude, longitude) {
        positioning = {lat: latitude, long:longitude};
        console.log(positioning);
        var urls = "https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat="+positioning.lat+"&lng="+positioning.long+"&fDstL=0&fDstU=100";

        loadJSONP(urls, function(data) {
            console.log(data);
            jsonrec = data;
            var table = document.getElementById("tables");
            if(jsonrec.acList.length != 0){
                var sorted = jsonrec.acList.sort(function (a,b) {
                    return b.Alt - a.Alt;
                });

                console.log(sorted);
                var num = 1;
                table.innerHTML = "";
                for(var i = 0; i < sorted.length; i++){
                    table.innerHTML += "<tr><th scope='row'>"+num+"</th><td>Mark</td><td>"+sorted[i].Alt
                        +" ft</td><td></td></tr>";
                }
            }
        });

    });

});
//stores current location
var positioning = {};
//stores json
var jsonrec = null;

//seeks geolocation permission from user
function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            callback.call(null, lat, lon);
        }, showError);

    } else {
        alert("Enable geolocation in order to make app work!");
    }
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

//handles json requests
var loadJSONP = (function(){
    var unique = 0;
    return function(url, callback, context) {
        // INIT
        var name = "_jsonp_" + unique++;
        if (url.match(/\?/)) url += "&callback="+name;
        else url += "?callback="+name;

        // Create script
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Setup handler
        window[name] = function(data){
            callback.call((context || window), data);
            document.getElementsByTagName('head')[0].removeChild(script);
            script = null;
            delete window[name];
        };

        // Load JSON
        document.getElementsByTagName('head')[0].appendChild(script);
    };
})();