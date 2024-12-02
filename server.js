const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

const allowedOrigins = ['http://localhost', 'https://test34343-6tz.pages.dev'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {}
  }
}));

const API_URL = 'https://mobile-riv.api.belgianrail.be/api/v1.0/dacs';
const API_KEY = 'IOS-v0001-20190214-YKNDlEPxDqynCovC2ciUOYl8L6aMwU4WuhKaNtxl';
const STATION_UIC_CODE = '8822004';
const COUNT = 30;

app.get('/api/departures', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}?query=DeparturesApp&UicCode=${STATION_UIC_CODE}&count=${COUNT}`, {
      headers: { 'x-api-key': API_KEY },
    });

    const departures = response.data.entries.map(entry => ({
      TrainNumber: entry.TrainNumber,
      CommercialType: entry.CommercialType,
      PlannedDeparture: entry.PlannedDeparture.slice(11, 16), // Extract HH:mm
      Platform: entry.Platform || 'N/A',
      DestinationNl: entry.DestinationNl,
      Delay: entry.DepartureDelay ? entry.DepartureDelay.slice(3, 5) + ' min' : 'On time', // Format delay in minutes
      IsDelayed: !!entry.DepartureDelay,
      IsAtPlatform: entry.DepartureStatusNl === 'aan perron', // True if train is at platform
    }));

    res.json(departures);
  } catch (error) {
    console.error('Error fetching departure data:', error.message);
    res.status(500).json({ error: 'Failed to fetch departure data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
