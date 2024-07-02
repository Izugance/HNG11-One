import axios from "axios";
import "dotenv/config";

/** Returns the city from the ip address, or null if the ip is
 *  invalid. */
async function getCity(ip) {
  try {
    let response = await axios.get(
      // `
      //   https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATIONIO_KEY}&ip=${ip}&fields=city
      // `
      `http://ip-api.com/json/${ip}?fields=city`
    );
    if (response.data.city) {
      return response.data.city;
    }
  } catch (err) {
    console.log("Couldn't get city for ip:", ip);
    console.log("Reason:", err.message);
  }

  return null;
}

/** Returns the latitude and longitude in an object, or null if the ip
 *  is invalid. */
async function getLatLon(ip) {
  try {
    let response = await axios.get(
      //   `
      //   https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATIONIO_KEY}&ip=${ip}&fields=latitude,longitude
      // `
      `http://ip-api.com/json/${ip}?fields=lat,lon`
    );
    if (response.data.lat) {
      return { lat: response.data.lat, lon: response.data.lon };
    }
  } catch (err) {
    console.log("Couldn't get coordinate data for ip:", ip);
    console.log("Reason:", err.message);
  }

  return null;
}

/** Returns the temperature from the ip address, or null if lat & lon
 *  are invalid. */
async function getTemperature(lat, lon) {
  try {
    let response = await axios.get(
      `
        https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&exclude={minutely,hourly,daily,alerts}&appid=${process.env.OPENWEATHERMAP_KEY}
      `
    );
    if (response.data.main.temp) {
      return response.data.main.temp;
    }
  } catch (err) {
    console.log(`Couldn't get temperature for lat ${lat} and lon ${lon}`);
    console.log("Reason:", err.message);
  }

  return null;
}

// (async () => {
//   console.log("getTemperature:", await getTemperature(null, null));
// })();
export { getCity, getLatLon, getTemperature };
