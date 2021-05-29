$.ajaxSetup({cache:false});


function exchanger(usd){
    var exchangeData;
    $.get('http://localhost:3000/exchange-api', '비트코인',(data) => {
        exchangeData = JSON.parse(data);
        console.log(exchangeData);
        var splitedEX = exchangeData[22].ttb.split(',');
        var USD2KRW = parseFloat(splitedEX[0] + splitedEX[1]);
        console.log((usd*USD2KRW).toFixed(2));
    });
    // return (usd*USD2KRW).toFixed(2);
}

exchanger(5);

function draw3(){
    var chartdata = [];


    $.getJSON('http://localhost:3000/poloniex-api', (data) => {
        var chartapi = JSON.parse(data);
        $.each(chartapi, (i, item) => {
            chartdata.push([item.date*1000, item.open, item.high, item.low, item.close]);
        });
    }).done(function(){
        Highcharts.stockChart('chart',{
            title: {
                text: 'BTC' + ' 차트 (5m)'
            },
            rangeSelector: {
                buttons: [
                    {type: 'minute',count: 30,text: '30m'},
                    {type: 'hour',count: 1,text: '1h'},
                    {type: 'hour',count: 2,text: '2h'},
                    {type: 'hour',count: 6,text: '6h'},
                    {type: 'all',count: 1,text: '1d'}
                ],
                selected: 3,
                inputEnabled: true
            },
            plotOptions: {
                candlestick: {
                    downColor: 'blue',
                    upColor: 'red'
                }
            },
            series: [{
                name: 'BTC USDT($)',
                type: 'candlestick',
                data: chartdata,
                tooltip: {
                    valueDecimals: 2
                },
                animation: {
                    duration: 2000
                }
            }]
        });
    });
}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function rbchecker(pcp){
    if(pcp > 0) {
        $('#diff_pcp').css('background-color','red');
        $('.coin_price').css('color','red');
        $('#real_price_bar').css('border-bottom','5px solid red');

    }
    else {
        $('#diff_pcp').css('background-color','blue');
        $('.coin_price').css('color','blue');
        $('#real_price_bar').css('border-bottom','5px solid blue');

    }
}

function bithumb(){
    $.get('http://localhost:3000/bithumb-api', function(data) {
        var btc = JSON.parse(data);
        var btc_price = parseFloat(btc.data['closing_price']);
        var btc_max_price = parseFloat(btc.data['max_price']);
        var btc_min_price = parseFloat(btc.data['min_price']);
        var btc_24H = (+btc.data['units_traded_24H']).toFixed(2);
        var btc_24H_acc = ((btc.data['acc_trade_value_24H'])/100000000).toFixed(2);
        var btc_pcp = +(btc.data['prev_closing_price']);
        var btc_diff = (btc_price - btc_pcp) / btc_pcp * 100;
        $('.coin_price').html(numberWithCommas(btc_price)+' KRW');
        $('#max_price').html(numberWithCommas(btc_max_price));
        $('#min_price').html(numberWithCommas(btc_min_price));
        $('#units_traded_24H').html(numberWithCommas(btc_24H));
        $('#acc_trade_value_24H').html(numberWithCommas(btc_24H_acc));
        $('#diff_pcp').html(btc_diff.toFixed(2) + '%');
        rbchecker(btc_diff);
    });
}

function getCoinNews(){
    $.getJSON('http://localhost:3000/naver-news-api', (data) => {
        var newsData = JSON.parse(data);

        $('.container').append('<div class="date">' + newsData.lastBuildDate + '</div>');

        for(let i=1; i<=10; i++){
            var newsContent = '<a href = "' + newsData.items[i-1].link + '"><h2 class="news_title">' + newsData.items[i-1].title 
            + '</h2><div class="news_description">' + newsData.items[i-1].description + '</div></a>'
            + '<div class = news_date>' + newsData.items[i-1].pubDate + '</div>'
            
            $('.container').append('<div class="news cell' + i + '"></div>');
            $('.cell' + i).html(newsContent);

        }

        
    });
}

function viewOtherCoins(){
    var widget = [];
    widget[0] = '<div class="tradingview-widget-container"><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>{"symbol": "BINANCE:BTCUSD","width": 350,"height": 220,"locale": "kr","dateRange": "3M","colorTheme": "light","trendLineColor": "#37a6ef","underLineColor": "#E3F2FD","isTransparent": false,"autosize": false,"largeChartUrl": ""}</script></div>';
    widget[1] = '<div class="tradingview-widget-container"><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>{"symbol": "BINANCE:ETHUSD","width": 350,"height": 220,"locale": "kr","dateRange": "3M","colorTheme": "light","trendLineColor": "#37a6ef","underLineColor": "#E3F2FD","isTransparent": false,"autosize": false,"largeChartUrl": ""}</script></div>';



    $('#other_coin').append(widget[0]);
    $('#other_coin').append(widget[1]);
    $('#other_coin').append(widget[2]);
    $('#other_coin').append(widget[3]);
    $('#other_coin').append(widget[4]);


}


function gotoUp(){
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
}

function proc() {
    bithumb();
    setTimeout("proc()", 500);
}

function proc2() {
    draw3();
    setTimeout("proc2()", 8000);
}


$(document).ready(function(){
    viewOtherCoins();
}); 

/* <script>
    new TradingView.widget(
    {
    "autosize": true,
    "symbol": "BINANCE:BTCUSD",
    "interval": "240",
    "timezone": "Asia/Seoul",
    "theme": "light",
    "style": "1",
    "locale": "kr",
    "toolbar_bg": "#f1f3f6",
    "enable_publishing": false,
    "hide_top_toolbar": true,
    "hide_legend": true,
    "save_image": false,
    "container_id": "tradingview_f6623"
    }
    );
    </script> */