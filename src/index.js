const express = require('express');
const cons = require('consolidate');
const path = require('path');
const morgan = require('morgan');
const app = express();

const httpPort = process.env.HTTP_PORT || 3000;

app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, '..', 'public'), { redirect: false }));

app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/', (req, res, next) => {
  res.render('index', {
    title: 'hello world'
  });
});

app.listen(httpPort, () => console.log(`Listening on port ${httpPort}`));
