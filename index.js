const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize the app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/practical')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define your schemas and models
const CountrySchema = new mongoose.Schema({
  name: String,
  code: String,
  total_states: Number,
  total_cities: Number,
});
const Country = mongoose.model('Country', CountrySchema);

const StateSchema = new mongoose.Schema({
    id: Number,
    name: String,
    country_id: Number,
    country_code: String,
    country_name: String,
    state_code: String,
    type: String,
    latitude: String,
    longitude: String
  });
  const State = mongoose.model('State', StateSchema);
  
  const CitySchema = new mongoose.Schema({
    id: Number,
    name: String,
    state_id: Number,
    state_code: String,
    state_name: String,
    country_id: Number,
    country_code: String,
    country_name: String,
    latitude: String,
    longitude: String,
    wikiDataId: String
  });
  const City = mongoose.model('City', CitySchema);

// List of countries with pagination
app.get('/countries', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const countries = await Country.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    console.log(countries);
  return res.json(countries);
});

// Search country with keyword
app.get('/countries/search', async (req, res) => {
  const { keyword } = req.query;
  const countries = await Country.find({ name: new RegExp(keyword, 'i') });
  res.json(countries);
});

// Search state with keyword
app.get('/states/search', async (req, res) => {
  const { keyword } = req.query;
  const states = await State.find({ name: new RegExp(keyword, 'i') });
  res.json(states);
});

// Get all the states by country with pagination
app.get('/countries/:countryCode/states', async (req, res) => {
  const { countryCode } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const states = await State.find({ country_code: countryCode })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  res.json(states);
});

// Search city with keyword
app.get('/cities/search', async (req, res) => {
  const { keyword } = req.query;
  const cities = await City.find({ name: new RegExp(keyword, 'i') });
  res.json(cities);
});

// Get all the cities by state with pagination
app.get('/states/:stateName/cities', async (req, res) => {
  const { stateName } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const cities = await City.find({ state_name: stateName })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  res.json(cities);
});

// Get information about a country by country name
app.get('/countries/:name', async (req, res) => {
  const { name } = req.params;
  const country = await Country.findOne({ name });
  if (!country) {
    return res.status(404).json({ message: 'Country not found' });
  }
  const states = await State.find({ country_code: country.code });
  const cities = await City.find({ state_name: { $in: states.map(state => state.name) } });
  res.json({
    name: country.name,
    code: country.code,
    total_states: states.length,
    total_cities: cities.length,
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
