import http from "http";

import express from "express";
import axios from "axios";
import "dotenv/config";

const app = express();
app.enable("trust proxy");
app.use(express.json());

/** Returns the city from the ip address, or null if the ip is
 *  invalid. */
async function getCity(ip) {
  let response;
  try {
    response = await axios.get(
      `
        https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATIONIO_KEY}&ip=${ip}&fields=city
      `
    );
  } catch (err) {
    return null;
  }
  return response.data.city;
}

/** Returns the temperature from the ip address, or null if the ip is
 *  invalid. */
async function getTemperature(ip) {
  const { lat, lon } = await getLatLon(ip);
  let response;
  try {
    response = await axios.get(
      `
      https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&exclude={minutely,hourly,daily,alerts}&appid=${process.env.OPENWEATHERMAP_KEY}
    `
    );
  } catch (err) {
    return null;
  }
  return response.data.main.temp;
}

/** FILL ME */
async function getLatLon(ip) {
  let response;
  try {
    response = await axios.get(
      `
      https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATIONIO_KEY}&ip=${ip}&fields=latitude,longitude
    `
    );
  } catch (err) {
    return null;
  }
  return { lat: response.data.latitude, lon: response.data.longitude };
}

/** GET. */
app.get("/api/hello", async (req, res) => {
  // Get location data from geolocation API.
  const ip = req.ip;
  const { lat, lon } = await getLatLon(ip);
  const city = await getCity(ip);
  const temperature = await getTemperature(lat, lon);
  const visitorName = req.query.visitor_Name;

  res.status(200).json({
    client_ip: ip,
    location: city,
    greeting:
      (!!visitorName &&
        !!city &&
        !!temperature.data &&
        `Hello, ${visitorName}. It is ${temperature} degrees celsius in ${city}`) ||
      null,
  });
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
