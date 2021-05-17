$.ajaxSetup({cache:false});

function draw3(){
    var chartdata = [];
    var url = 'https://poloniex.com/public?command=returnChartData&currencyPair=USDT_BTC&start=' + (new Date().getTime()-86400000 + "").substring(0,10) + '&end=9999999999&period=300';

    $.getJSON(url, (data) => {
        $.each(data, (i, item) => {
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
        $('#coin_price').css('color','red');

    }
    else {
        $('#diff_pcp').css('background-color','blue');
        $('#coin_price').css('color','blue');

    }
}

function bithumb(){
    $.get('https://api.bithumb.com/public/ticker/BTC_KRW', function(data) {
        var btc_price = parseFloat(data['data']['closing_price']);
        var btc_max_price = parseFloat(data['data']['max_price']);
        var btc_min_price = parseFloat(data['data']['min_price']);
        var btc_24H = (+data['data']['units_traded_24H']).toFixed(2);
        var btc_24H_acc = ((data['data']['acc_trade_value_24H'])/100000000).toFixed(2);
        var btc_pcp = +(data['data']['prev_closing_price']);
        var btc_diff = (btc_price - btc_pcp) / btc_pcp * 100;
        $('#coin_price').html(numberWithCommas(btc_price)+' KRW');
        $('#max_price').html(numberWithCommas(btc_max_price));
        $('#min_price').html(numberWithCommas(btc_min_price));
        $('#units_traded_24H').html(numberWithCommas(btc_24H));
        $('#acc_trade_value_24H').html(numberWithCommas(btc_24H_acc));
        $('#diff_pcp').html(btc_diff.toFixed(2) + '%');
        rbchecker(btc_diff);
    });
}

function proc() {
    bithumb();
    setTimeout("proc()", 500);
}

function proc2() {
    draw3();
    setTimeout("proc2()", 3000);
}
