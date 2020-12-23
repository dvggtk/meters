process.root = __dirname;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const _sseRouter = require('./routes/_sse');
const apiRouter = require('./routes/api');
const uploadRouter = require('./routes/upload');
const readingsRouter = require('./routes/readings');

var app = express();

app.set('trust proxy', true);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

app.use((req, res, next) => {
  res.locals.NODE_ENV = req.app.get("env");
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/_server-sent-events', _sseRouter);
app.use('/api', apiRouter);
app.use('/upload', uploadRouter);
app.use('/readings', readingsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (req.app.get('env') === 'development') console.error(err);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
