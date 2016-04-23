const express = require('express');
const cons = require('consolidate');
const path = require('path');
const morgan = require('morgan');
const scssMiddleware = require('./middleware/scss');
const staticMiddleware = require('./middleware/static');
const app = express();

const httpPort = process.env.HTTP_PORT || 3000;

//
// Setup
//
app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(morgan('combined'));
app.use(scssMiddleware);
app.use('/public', staticMiddleware);

//
// Routes
//
app.get('/', (req, res, next) => {
  res.render('layout', {
    title: 'index'
  });
});

//
// 3... 2... 1...
//
app.listen(httpPort, () => console.log(`Listening on port ${httpPort}`));
