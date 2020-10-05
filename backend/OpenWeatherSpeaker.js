/**
  * This file belongs to The OpenWeather Speaker Project.
  * Copyright (c) 2020 Theodore R. Smith <theodore@phpexperts.pro>
 **/

require('dotenv').config();
const express = require("express");
const app = express();

const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY;

app.listen(3000, () => {
    res.json([{"Tony": "Montanya"}, {"Vincent": "Vega"}, {"Jules": "Winnfield"}]);
});

