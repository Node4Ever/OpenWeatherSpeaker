/**
  * This file belongs to The OpenWeather Speaker Project.
  * Copyright (c) 2020 Theodore R. Smith <theodore@phpexperts.pro>
 **/

require('dotenv').config();
const axios = require('axios');
const express = require("express");
const app = express();

const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY;
const OPENWEATHER_HOST = "https://api.openweathermap.org";

app.get('/', function (req, res) {
    res.send('Hello, World!');
});

function grabDailyForecast(dailyData)
{
    if (!dailyData || !dailyData.list || !dailyData.list[0].dt_txt) {
        throw "Couldn't parse the OpenWeather API data. Did the API change?";
    }

    dailyData.list.forEach(threeHourSummary => {
        const date = new Date(threeHourSummary.dt);
        console.log(threeHourSummary.dt + ' => ' + threeHourSummary.dt_txt + ' vs ' + date.getDate())
        // date.getUTCHours()
        // date.getDate();
    });
}


app.get("/weather/:city/5-day", function (req, res) {
    const city = req.params.city;
    const apiURL = `${OPENWEATHER_HOST}/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_APIKEY}`;

    axios.get(apiURL).then(response => {
        // res.send(response.data);
        grabDailyForecast(response.data);
        res.send(JSON.stringify(response.data, null, 4));
    })
    .catch(error => {
        res.send({
            "error": "Something went wrong",
            "details": error
        });
    });
});

app.listen(3000);
