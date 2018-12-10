const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const cors = require('cors');

const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.connect(config.dbURL, config.options);
mongoose.connection
    .once('open', () => {
      console.log(`Mongoose - successful connection ...`);
    })
    .on('error', error => console.warn(error));

const MongoStore = require('connect-mongo')(session);

const indexRouter = require('./routes/index.router');
const roomRouter = require('./routes/room.router');
const messageRouter = require('./routes/message.router');

const ws = require('./ws/message.ws');

const app = express();

const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true
};
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('trust proxy', 1);
app.use(session({
  secret: "balerion-2nd_dc",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

app.use('/api/room', roomRouter);
app.use('/api/messages', messageRouter);

app.use(express.static(path.join(__dirname, '../front/dist/')));
app.use('*', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
