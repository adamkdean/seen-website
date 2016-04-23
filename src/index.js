const express = require('express');
const cons = require('consolidate');
const path = require('path');
const morgan = require('morgan');
const scssMiddleware = require('./middleware/scss');
const staticMiddleware = require('./middleware/static');

const workdir = process.cwd();
const httpPort = process.env.HTTP_PORT || 3000;
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
// Routes
//
app.get('/', (req, res) => {
  res.render('index', {
    title: 'SEEN'
  });
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
