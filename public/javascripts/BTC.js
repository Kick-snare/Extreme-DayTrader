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
draw3();


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function bithumb(){
    $.get('https://api.bithumb.com/public/ticker/BTC_KRW', function(data) {
        var bithumb_btc = parseFloat(data['data']['closing_price']);
        $('#coin_price').html(numberWithCommas(bithumb_btc) + '원'); // 거래소 시세 정보 표에 값 세팅
    });
}

// 갱신 함수
function proc() {
    bithumb(); // 빗썸

    // poloniex();
    setTimeout("proc()", 500); //10초후 재시작
}