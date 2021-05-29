var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
const { request } = require('express');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/BTC', (req,res) => {
  res.render('BTC');
})

app.get('/bithumb-api', (req,res) => {
  var request = require('request');
  var options = {
    'method': 'GET',
    'url': 'https://api.bithumb.com/public/ticker/BTC_KRW'
  };
  request(options, function (error, response) { 
    if (error) throw new Error(error);
      res.json(response.body);
  });
})

app.get('/poloniex-api', (req,res) => {
  var request = require('request');
  var options = {
    'method': 'GET',
    'url': 'https://poloniex.com/public?command=returnChartData&currencyPair=USDT_BTC&start=' + (new Date().getTime()-86400000 + "").substring(0,10) + '&end=9999999999&period=300'
  };

  request(options, function (error, response) { 
    if (error) throw new Error(error);
      res.json(response.body);
  });
})


app.get('/naver-news-api', (req, res) => {
  var client_id = 'MwaTRbnO3I56Rn0QYl2C';
  var client_secret = 'P4l4XvsaOh';
  console.log('쿼리는 ? : ' + req.query.query);

  var request = require('request');
  var options = {
    'method': 'GET',
    
    'url': 'https://openapi.naver.com/v1/search/news?query=' + encodeURI(req.query) ,
    'headers': {
      'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret
    }
  };
  request(options, function (error, response) {
    console.log(error);
    if (error) throw new Error(error);
    res.json(response.body);  
  });

})

app.get('/exchange-api', (req, res) =>{
  var authKey = 'na6MZ4hyaWKOkcEhUdOPhLy5NbIu4yoI';
  var request = require('request');
  var options = {
    'method': 'GET',
    'url': 'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=' + authKey +'&searchdate=20210528&data=AP01',
    'headers': {
      'Cookie': 'JSESSIONID=D005CCC3C7BF59637E63E41E24A79CC1'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.json(response.body); 
  });

})



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
