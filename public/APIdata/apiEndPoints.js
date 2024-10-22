import APIKeys from "./apiKeys.js";

function getApiEndPoints(cityName,lat_long){
    return {
    openWeatherMap: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKeys.openWeatherMap}&units=metric`,
    weatherBit: `https://api.weatherbit.io/v2.0/current?city=${cityName}&key=${APIKeys.weatherBit}`,
    pirateWeather: `https://api.pirateweather.net/forecast/${APIKeys.pirateWeather}/${lat_long}?&units=si`,
    tomorrow: `https://api.tomorrow.io/v4/weather/forecast?location=${cityName}&apikey=${APIKeys.tomorrow}`
  };
}

export default getApiEndPoints;
