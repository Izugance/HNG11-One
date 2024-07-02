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
  const response = await axios.get(
    `
      https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATIONIO_KEY}&ip=${ip}&fields=city
    `,
  );
  return response.data.city;
}

/** Returns the temperature from the ip address, or null if the ip is
 *  invalid. */
async function getTemperature(ip) {
  const { lat, lon } = await getLatLon(ip);
  const response = await axios.get(
    `
      https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&exclude={minutely,hourly,daily,alerts}&appid=${process.env.OPENWEATHERMAP_KEY}
    `
  );
  return response.data.main.temp;
}



/** FILL ME */
async function getLatLon(ip) {
  const response = await axios.get(
    `
      https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATIONIO_KEY}&ip=${ip}&fields=latitude,longitude
    `
  );
  return { lat: response.data.latitude, lon: response.data.longitude };
}

/** GET. */
app.use("/api/hello", async (req, res) => {
  // Get location data from geolocation API.
  const ip = req.ip;
  const latLon = await getLatLon(ip);

  let city = null;
  try {
    city = await getCity(ip);
    console.log("City:", city);
  } catch (err) {
    console.err(err);
  }

  let temperature = null;
  try {
    temperature = await getTemperature(latLon.lat, latLon.lon);
  } catch (err) {
    console.err(err);
  }

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

// (async () => {
//   const latLon = await getCity("172.20.10.3");
//   console.log("lat lon:", latLon);
// })();
