const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const session = require('express-session');
const favicon = require('serve-favicon');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const mysql = require('mysql2');
const MySQLStore = require('express-mysql-session');
const { secretKey } = require('./lib/misc.js');

const connection = require('./lib/server/config.js');

const app = express();
const { rejects } = require('assert');

let sessionStore = new MySQLStore({}, connection.promise( ));
let sessionRoute = require('./routes/session.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable(`X-Powered-By`);

app.use(favicon(__dirname + '/favicon.ico'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: secretKey,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  name: 'iwxcollections-cookie',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, //1 day
    sameSite: "lax"
  }
}));

/*
 * ROUTES ---
 */

app.use('*', sessionRoute);
require('./routes/index.js')(app); /* '/', '/home' */
require('./routes/shop.js')(app); /* '/shop' */
require('./routes/products.js')(app); /* '/products/:idx' */
require('./routes/login.js')(app); /* '/login', '/account' */
require('./routes/signup.js')(app); /* '/signup' */
require('./routes/cart.js')(app);  /* '/cart' */
require('./routes/checkout.js')(app); /* /checkout */
require('./routes/order.js')(app); /* POST: /oreder */
require('./routes/webhook.js')(app); /* /webhook */


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
