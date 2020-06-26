$(document).ready(function() {

    $("#submitBtn").on("click", function() {    
        var searchValue = $("#input").val();
        console.log(searchValue);
        
        //clear input box
        $("#input").val("");
        searchWeather(searchValue);
    });

    $(".history").on("click", "li", function() {
        searchWeather($(this).text());  
    });

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $(".history").append(li);
    }
    //Current Weather API call function
    function searchWeather(searchValue) {
        $.ajax({
          type: "GET",
          url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=63a75dc10b147a5400a0001bbf666b5c&units=imperial",
          datatype: "json",
          success: function(data) {
            // create history link for this search
            //console.log(url)
            console.log(data)
            if (history.indexOf(searchValue) === -1){
                history.push(searchValue);
                window.localStorage.setItem("history", JSON.stringify(history));

                makeRow(searchValue);
                
            }
            
            //clear old content
            $("#today").empty();

            //create HTML content for current weather
            var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
            var card = $("<div>").addClass("card");
            var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
            var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
            var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " F");
            var cardBody = $("<div>").addClass("card-body");
            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

            // merge and add to page
             title.append(img);
             cardBody.append(title, temp, humid, wind);
             card.append(cardBody);
             $("#today").append(card);

            // call to api endpoints
            getForecast(searchValue);
            getUVIndex(data.coord.lat, data.coord.lon);
        }    
        });
    }
    //five day forecast API call
   function getForecast(searchValue) {
       $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=63a75dc10b147a5400a0001bbf666b5c&units=imperial",
        dataType: "json",
        success: function(data) {
            //overwrite any existing content with title and empty row
            $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

            
            //loop for all forecasts (3hour segments)
            for (var i = 0; i < data.list.length; i++){
                console.log(data)
                if(data.list[i].dt_txt.indexOf("15:00:00")!==-1){
                    // create HTML elements for card
                    var col = $("<div>").addClass("col-md-2");
                    var card = $("<div>").addClass("card bg-primary text-white");
                    var body = $("<div>").addClass("card-body p-2");
    
                    var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
    
                    var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
    
                    var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp + "F");
                    var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
    
                    //merge together and put on page
                    col.append(card.append(body.append(title, img, p1, p2)));
                    $("#forecast .row").append(col);
                }

                
                
            }
        }
       })
   }
    //UV Index call to API
    function getUVIndex(lat, lon){
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/uvi?appid=63a75dc10b147a5400a0001bbf666b5c&lat=" + lat + "&lon=" + lon,
            dataType: "json",
            success: function(data) {
                var uv = $("<p>").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(data.value);

                // change color depending on uv value
                if (data.value < 3) {
                    btn.addClass("btn-success");
                }
                else if (data.value < 7) {
                    btn.addClass("btn-warning");
                }
                else {
                    btn.addClass("btn-danger");
                }
            
                $("#today .card-body").append(uv.append(btn));
            }
        });
    }

//get history of cities searched and display in sidebar
    var history = JSON.parse(window.localStorage.getItem("history")) || [];

    if (history.length > 0){
        searchWeather(history[history.length-1]);
    }

    for (var i = 0; i < history.length; i++){
        makeRow(history[i]);
    }
});