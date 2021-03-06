document.addEventListener("DOMContentLoaded", function (event) {
    //set interval added to refresh data on every minute
    setInterval(getLocation(function (latitude, longitude) {
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
                jsonrec = sorted;
                console.log(sorted);
                var num = 1;
                table.innerHTML = "";
                if(sorted.length > 9){
                    document.getElementById("content").style.overflowY = "scroll";
                } else {
                    document.getElementById("content").style.overflowY = "hidden";
                }
                for(var i = 0; i < sorted.length; i++){
                    var bound = null;
                    var numm = String(sorted[i].Alt).charAt(0) + String(sorted[i].Alt).charAt(1);
                    //like this beacuse I read somewhere that planes that go west are on even 1000's feet altitudes and east on odd
                    if(Number(numm) % 2 == 0){
                        bound = "<i class='fas fa-plane' data-fa-transform='rotate-225'>";
                    } else {
                        bound = "<i class='fas fa-plane' data-fa-transform='rotate-315'>";
                    }
                    var tagg = "";
                    //I am still unsure to use either Call or OpIcao to get code if necessary
                    if(sorted[i].OpIcao == undefined){
                        var j = 0;
                        while(isNaN(String(sorted[i].Call).charAt(j))){
                            tagg += String(sorted[i].Call).charAt(j);
                            j++;
                        }
                    } else {
                        tagg = sorted[i].OpIcao;
                    }
                    table.innerHTML += "<tr class='inserted'><th scope='row'>"+num+"</th><td>"+bound+"</i></td><td>"+
                    sorted[i].Alt+" ft</td><td>"+tagg+" "+sorted[i].Sqk+"</td></tr>";
                    num++;
                }

                var classname = document.getElementsByClassName("inserted");
                console.log(classname);

                for (var k = 0; k < classname.length; k++) {
                    classname[k].addEventListener('click', rowClicked, false);
                }
            }
        });

    }),60000);

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
var loadJSONP = (() => {
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

//handles clicked rows in table
var rowClicked = (e) => {
    document.getElementById("masking").setAttribute("class", "shown");
    var attribute = e.srcElement.parentNode.childNodes[3].innerHTML;
    console.log(attribute);
    for(var i = 0; i < jsonrec.length; i++){
        var taggs = "";
        if(jsonrec[i].OpIcao == undefined){
            var j = 0;
            while(isNaN(String(jsonrec[i].Icao).charAt(j))){
                taggs += String(jsonrec[i].Icao).charAt(j);
                j++;
            }
        } else {
            taggs = jsonrec[i].OpIcao;
        }
        var flightnumber = taggs+" "+jsonrec[i].Sqk;
        if(flightnumber == attribute){
            let compName = String(jsonrec[i].Op);
            console.log(compName);
            getJSON("https://company.clearbit.com/v1/domains/find?name=" + compName, (data) => {
                console.log(data.logo);//popravio sam dosta ali javlja greske kad ne nadje kompaniju gomno.

                let logourl = data.logo;

                if(compName == "Middle East Airlines")//exeption because not in database
                    logourl = "https://logo.clearbit.com/mea.com.lb";
                
                document.getElementById("infodiv").innerHTML = "<div class='col-lg-12 text-center'>" +
                    "<h3>Flight Information</h3></div><div class='col-lg-12 text-left row'><hr/>" +
                    "<h5 class='col-lg-12' >Aircraft</h5>" +
                    "<h6 class='col-lg-12'>Manufacturer: "+jsonrec[i].Man+"</h6>" +
                    "<h6 class='col-lg-12'>Model: "+jsonrec[i].Mdl+"</h6><hr/>" +
                    "<h5 class='col-lg-12'>Origin and Destination</h5>" +
                    "<h6 class='col-lg-12'>From: "+jsonrec[i].From+"</h6>" +
                    "<h6 class='col-lg-12'>To: "+jsonrec[i].To+"</h6><hr/>" +
                    "<h5 class='col-lg-12'>Logo</h5>" +
                    "<img src='"+logourl+"' height='70px' width='70px' alt='"+jsonrec[i].Op+"'></div>" +
                    "<button id='closediv' class='col-lg-12'>Close</button>";

                document.getElementById("closediv").addEventListener("click", function () {
                    document.getElementById("masking").setAttribute("class", "hidden");
                });
            });

        }
    }
};

var getJSON = (url, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = '';
    xhr.withCredentials = false;
    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("Authorization","Bearer sk_d3202709137c52371c2185035d706ba0");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            callback(myArr);
        }
    };
    xhr.send();
};