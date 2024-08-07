import http from "http";

import express from "express";
import "dotenv/config";

import { getCity, getLatLon, getTemperature } from "./get-data.js";

const app = express();
app.enable("trust proxy");
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send("Welcome to the greet API.");
});
/** GET. */
app.get("/api/hello", async (req, res) => {
  const ip = req.ip; // Local test URL: "24.48.0.1";
  const latLon = await getLatLon(ip);
  const city = await getCity(ip);
  let temperature = null;
  if (!!latLon) {
    temperature = await getTemperature(latLon.lat, latLon.lon);
  }
  const visitorName = req.query.visitor_name || null;

  res.status(200).json({
    client_ip: ip,
    location: city,
    greeting:
      (!!visitorName &&
        !!city &&
        !!temperature &&
        `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celcius in ${city}`) ||
      null,
  });
});

app.use(async (req, res, next) => {
  return res.status(404).send("Endpoint does not exist");
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
