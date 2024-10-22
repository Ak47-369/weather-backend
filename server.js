import express from "express";
import bodyParser from "body-parser";
import getApiEndPoints from "./public/APIdata/apiEndPoints.js";
import APIKeys from "./public/APIdata/apiKeys.js";
import cors from 'cors';
import weatherCodes from "./public/APIdata/weatherCodes.js";


const app = express();
app.use(cors()); // Enable CORS for all routes

// body-parser Middleware to parse url encoded body
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json()); // parse JSON payloads

// To use local static files, such as images, style.css
app.use(express.static('public'));
app.use('/assets', express.static('assets'));


app.post("/getWeatherData",async function(request,response){
  console.log('Received request with body:', request.body);
  let cityName = request.body.city;
  console.log(cityName);
  let lat_long = " "; // Initialize with a default value
 
  const weatherData = {};
  const geoAPI = `https://geocode.maps.co/search?q=${cityName}&api_key=${APIKeys.geoAPI}`
    try {
      const res = await fetch(geoAPI);
      const data = await res.json();
      lat_long = data[0].lat + "," + data[0].lon;
      
      const apiUrls = getApiEndPoints(cityName,lat_long);
      const promises = Object.keys(apiUrls).map(api => fetch(apiUrls[api]));
      const responses = await Promise.all(promises);
      const dataPromises = responses.map(res => res.json());
      const results = await Promise.all(dataPromises);
  
      results.forEach((data, index) => {
        const api = Object.keys(apiUrls)[index];
        data.statusCode = responses[index].status;

        // console.log(api);
        // console.log(data);

        if (data.statusCode >= 400) {
          weatherData[api] = {
            apiName: api,
            temperature: '',
            weather: '',
            windSpeed: '',
            statusCode: data.statusCode,
            imageUrl: ''
          };
        } 
        
        else {
          switch (api) {
            case 'openWeatherMap':
              const openWeatherIcon =  data.weather[0].icon;
              weatherData[api] = {
                apiName : api,
                temperature: data.main.temp,
                weather: data.weather[0].description,
                windSpeed : data.wind.speed,
                statusCode : data.statusCode,
                imageUrl: `https://openweathermap.org/img/wn/${openWeatherIcon}@2x.png`
              };
              break;
      
            case 'weatherBit':
              const weatherBitIcon = data.data[0].weather.icon;
              weatherData[api] = {
                apiName : api,
                temperature: data.data[0].temp,
                weather: data.data[0].weather.description,
                windSpeed: data.data[0].wind_spd,
                statusCode : data.statusCode,
                imageUrl: `https://www.weatherbit.io/static/img/icons/${weatherBitIcon}.png`
              };
              break;
      
            case 'tomorrow':
              const tomorrowIcon = data.timelines.hourly[0].values.weatherCode;
              weatherData[api] = {
                apiName : api,
                temperature: data.timelines.minutely[0].values.temperature,
                windSpeed: data.timelines.minutely[0].values.windSpeed,
                weather : weatherCodes[tomorrowIcon], // Getting corresponding weather detail for weatherCode
                statusCode : data.statusCode,
                imageUrl : `http://localhost:3000/assets/${tomorrowIcon}.png `
              };
              break;
      
            case 'pirateWeather':
              const pirateWeatherIcon = data.currently.icon;
              weatherData[api] = {
                apiName : api,
                temperature: data.currently.temperature,
                weather: data.currently.summary,
                windSpeed: data.currently.windSpeed,
                statusCode : data.statusCode,
                imageUrl : `http://localhost:3000/assets/${pirateWeatherIcon}.png `
              };
              break;
      
            default:
              console.error(`Unknown API: ${api}`);
          }
        }
      });

      response.set("Content-Type", "application/json");
      response.send(JSON.stringify(weatherData));
    } catch (error) {
      console.error(error);
      response.status(500).send("Error fetching weather data");
    }
});


app.listen(process.env.PORT || 3000, function(){
    console.log("Server is Running on Port 3000");
});