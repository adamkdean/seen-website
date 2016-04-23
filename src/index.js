require('nomoreunhandledrejections')();

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

const baseViewModel = {
  posterUrlPrefix: 'https://image.tmdb.org/t/p/w300'
};

//
// Setup
//
app.engine('dust', cons.dust);
cons.dust.helpers = require('dustjs-helpers');
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
};

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
const getFilmBySlug = async (slug) => await apiWrapper(`/film/${slug}`);
const getReviewsByFilmSlug = async (slug) => await apiWrapper(`/reviews/${slug}`);

//
// Routes
//
app.get('/', async (req, res) => {
  const films = await getPopularFilms();
  const reviews = await getPopularReviews();
  const viewModel = Object.assign({}, baseViewModel, { films, reviews });
  res.render('index', viewModel);
});

app.get('/films', async (req, res) => {
  const lastWeek = await getPopularFilms('last_week');
  const lastMonth = await getPopularFilms('last_month');
  const lastYear = await getPopularFilms('last_year');
  const allTime = await getPopularFilms('all_time');
  const viewModel = Object.assign({}, baseViewModel, {
    title: 'Films - SEEN',
    lastWeek,
    lastMonth,
    lastYear,
    allTime
  });
  res.render('films', viewModel);
});

app.get('/film/:slug', async (req, res) => {
  const slug = req.params.slug;
  const film = await getFilmBySlug(slug);
  const reviews = await getReviewsByFilmSlug(slug);
  const viewModel = Object.assign({}, baseViewModel, { title: `${film.title} - SEEN`, film, reviews });
  res.render('film', viewModel);
});

app.get('/reviews', async (req, res) => {
  const thisWeek = await getPopularReviews('last_week');
  const thisMonth = await getPopularReviews('last_month');
  const thisYear = await getPopularReviews('last_year');
  const allTime = await getPopularReviews('all_time');
  const viewModel = Object.assign({}, baseViewModel, {
    title: 'Reviews - SEEN',
    thisWeek,
    thisMonth,
    thisYear,
    allTime
  });
  res.render('reviews', viewModel);
});

//
// 3... 2... 1...
//
app.listen(httpPort, () => console.log(`Listening on port ${httpPort}`));
