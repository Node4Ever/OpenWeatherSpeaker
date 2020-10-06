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

function determineCloudiness(cloud_coverPercent)
{
    // See http://weather.gfc.state.ga.us/Info/WXexp.aspx
    if (cloud_coverPercent <= 20) {
        return "mostly-sunny";
    } else if (cloud_coverPercent <= 50) {
        return "partly-sunny";
    } else if (cloud_coverPercent <= 70) {
        return "mostly-cloudy";
    }

    return "cloudy";
}

async function fetchUVIndex(lat, long)
{
    const apiURL = `${OPENWEATHER_HOST}/data/2.5/uvi?appid=${OPENWEATHER_APIKEY}&lat=${lat}&lon=${long}`;

    return await axios.get(apiURL);
}

function grabDailyForecast(data)
{
    const date = new Date(data.dt);

    return {
        coords: { lat: data.coord.lat, long: data.coord.lon },
        city: data.name,
        date: date.toDateString(),
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        wind_speed: data.wind.speed
    };
}

function grab5DaySummary(dailyData)
{
    if (!dailyData || !dailyData.list || !dailyData.list[0].dt_txt || !dailyData.list[0].main) {
        throw "Couldn't parse the OpenWeather API data. Did the API change?";
    }

    let days = [];
    let currentDay = null;
    dailyData.list.forEach(threeHourSummary => {
        // Turns "2020-10-01 11:33:22" into "2020-10-01".
        const date = threeHourSummary.dt_txt.split(' ')[0];

        // Create a new currentDay when the date changes.
        if (!currentDay || currentDay.date != date) {
            // Store the previous day.
            if (currentDay) {
                days.push(currentDay);
            }

            currentDay = {
                date: date,
                temp: { high: null, low: null },
                humidity: null,
                cloud_cover: null,
                weather: null
            };
        }

        if (!currentDay.temp.high || threeHourSummary.main.temp_max > currentDay.temp.high) {
            currentDay.temp.high = threeHourSummary.main.temp_max;
        }
        if (!currentDay.humidity || threeHourSummary.main.humidity > currentDay.humidity) {
            currentDay.humidity = threeHourSummary.main.humidity;
        }

        // Pick 3 PM for weather conditions.
        if (threeHourSummary.dt_txt.split(' ')[1] === '15:00:00') {
            currentDay.wind = threeHourSummary.wind;
            currentDay.cloud_cover = determineCloudiness(threeHourSummary.clouds.all);
            currentDay.weather = threeHourSummary.weather[0];
        }
    });

    return days;
}

app.get('/weather/:city', function (req, res) {
    const city = req.params.city;
    const apiURL = `${OPENWEATHER_HOST}/data/2.5/weather?appid=${OPENWEATHER_APIKEY}&q=${city}&units=imperial`;

    axios.get(apiURL).then(response => {
        let forecast = grabDailyForecast(response.data);

        fetchUVIndex(forecast.coords.lat, forecast.coords.lat)
        .then(response => {
            forecast.uv_index = response.data.value;
            console.log(forecast);
            res.send(JSON.stringify(forecast, null, 4));
        })
    })
    .catch(error => {
        res.send({
            "error": "Something went wrong2",
            "details": error
        });
    });
});

app.get("/weather/:city/5-day", function (req, res) {
    const city = req.params.city;
    const apiURL = `${OPENWEATHER_HOST}/data/2.5/forecast?appid=${OPENWEATHER_APIKEY}&q=${city}&units=imperial`;

    axios.get(apiURL).then(response => {
        // res.send(response.data);
        res.send(JSON.stringify(grab5DaySummary(response.data), null, 4));
    })
    .catch(error => {
        res.send({
            "error": "Something went wrong",
            "details": error
        });
    });
});

app.listen(3000);
