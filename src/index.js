const express = require('express');
const cons = require('consolidate');
const path = require('path');
const morgan = require('morgan');
const axios = require('axios');
const scssMiddleware = require('./middleware/scss');
const staticMiddleware = require('./middleware/static');

const workdir = process.cwd();
const httpPort = process.env.HTTP_PORT || 3000;
const api = axios.create({ baseURL: process.env.API_URL || 'http://localhost:8000/' });
const app = express();

//
// Setup
//
app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', path.join(workdir, 'views'));

app.use(morgan('combined'));
app.use(scssMiddleware);
app.use('/public', staticMiddleware);

//
// Simple cache
//
const simpleCache = {
  cache: [],
  expiration: 60, // seconds
  timestamp: () => Math.floor(Date.now() / 1000),
  get: function get(key) {
    return (this.cache[key] && this.cache[key].validUntil >= this.timestamp())
      ? this.cache[key].value
      : delete this.cache[key] && null;
  },
  set: function set(key, data) {
    return this.cache[key] = {
      validUntil: this.timestamp() + this.expiration,
      value: data
    };
  }
}

//
// API wrappers
//
const apiWrapper = async (endpoint) => {
  let data = simpleCache.get(endpoint);

  if (data === null) {
    const result = await api.get(endpoint);
    if (result.status === 200) {
      simpleCache.set(endpoint, result.data);
      data = result.data;
    }
  }

  return data;
};

const getPopularFilms = async (when = 'last_week') => await apiWrapper(`/films?when=${when}`);
const getPopularReviews = async (when = 'last_week') => await apiWrapper(`/reviews?when=${when}`);

//
// Routes
//
app.get('/', async (req, res) => {
  const films = await getPopularFilms();
  const reviews = await getPopularReviews();

  console.log(
    films.length,
    reviews.length
  );

  res.render('index', {});
});

app.get('/films', (req, res) => {
  res.render('films', {
    title: 'Films - SEEN'
  });
});

app.get('/film/:slug', (req, res) => {
  res.render('film', {
    title: 'Film (Single) - SEEN'
  });
});

app.get('/reviews', (req, res) => {
  res.render('reviews', {
    title: 'Reviews - SEEN'
  });
});

app.get('/review/:slug', (req, res) => {
  res.render('review', {
    title: 'Review (Single) - SEEN'
  });
});

app.get('/search', (req, res) => {
  res.render('search', {
    title: 'Search - SEEN'
  });
});

//
// 3... 2... 1...
//
app.listen(httpPort, () => console.log(`Listening on port ${httpPort}`));
