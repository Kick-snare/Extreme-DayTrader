$.ajaxSetup({ cache: false });
// 같은 URL에 대해 캐싱 되는 문제 해결


/*--------GLOBAL VARIVABLES---------*/
var entry = 0; // 진입가
var realtime = 0; // 실시간 종가
var for_realtime = 0; // 마지막으로 호출한 realtime
var mycoin = 0; // 코인 수량
var beep = true; // 소리 출력 여부

/*--------AUDIO OBJECTS---------*/
var audio_mid = new Audio('../sound/mid.mp3');
var audio_up = new Audio('../sound/up.mp3');
var audio_down = new Audio('../sound/down.mp3');
var audio_high = new Audio('../sound/high.mp3');
var audio_low = new Audio('../sound/low.mp3');

/*--------AUDIO OBJECTS FOR FUN---------*/
// var audio_up = new Audio('../sound/Mars.mp3');
// var audio_down = new Audio('../sound/low_fun.mp3');
// var audio_high = new Audio('../sound/goToMars.mp3');
// var audio_low = new Audio('../sound/lowlow_fun.mp3');
// var audio_down = new Audio('../sound/narak.mp3');
// var audio_low = new Audio('../sound/narak.mp3');

/*--------FUNCTIONS---------*/

/*
* getExchange()
* 환율 정보를 가져와 USD to KRW 환율을 콜백함수로 넘겨줍니다.
* @callback {void} callback func
*/
function getExchange(callback) {
    $.get('http://localhost:3000/exchange-api', (data) => {
        var exchangeData = JSON.parse(data);
        var splitedEX = exchangeData[22].ttb.split(',');
        var USD2KRW = parseFloat(splitedEX[0] + splitedEX[1]).toFixed(2);
        callback(USD2KRW);
    });
}

/*
* bithumb()
* bithumb api를 받아와 여러가지 데이터를 파싱하여 선택한 노드들을 수정하고 rbchecker를 호출
*/
function bithumb() {
    $.get('http://localhost:3000/bithumb-api', function (data) {
        var btc = JSON.parse(data);

        for_realtime = realtime;
    
        realtime = parseFloat(btc.data['closing_price']);

        var btc_max_price = parseFloat(btc.data['max_price']);
        var btc_min_price = parseFloat(btc.data['min_price']);
        var btc_24H = (+btc.data['units_traded_24H']).toFixed(2);
        var btc_24H_acc = ((btc.data['acc_trade_value_24H']) / 100000000).toFixed(2);
        var btc_pcp = +(btc.data['prev_closing_price']);
        var btc_diff = (realtime - btc_pcp) / btc_pcp * 100;

        $('.coin_price').html(numberWithCommas(realtime) + ' KRW');
        $('#coin_price_real').html(numberWithCommas(realtime) + ' KRW');
        $('#max_price').html(numberWithCommas(btc_max_price));
        $('#min_price').html(numberWithCommas(btc_min_price));
        $('#units_traded_24H').html(numberWithCommas(btc_24H));
        $('#acc_trade_value_24H').html(numberWithCommas(btc_24H_acc));
        $('#diff_pcp').html(btc_diff.toFixed(2) + '%');

        rbchecker(btc_diff);
    });
}

/*
* numberWithCommas()
* @param {number} x 화면부에 띄울 숫자
* @return {string} x를 문자열로 바꾸어 3자리마다 comma를 붙여 반환한다.
*/
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/*
* chartDrawer()
* getExchange의 콜백함수로 쓰이며 넘겨 받은 환율정보를 토대로 차트 api를 받아와 차트를 구현한다.
* @prarm {number} usd2krw 환율 정보
*/
function chartDrawer(usd2krw) {
    var chartdata = [];
    $.getJSON('http://localhost:3000/poloniex-api', (data) => {
        var chartapi = JSON.parse(data);

        $.each(chartapi, (i, item) => {
            chartdata.push([item.date * 1000, usd2krw * item.open,
            usd2krw * item.high, usd2krw * item.low, usd2krw * item.close]);
        });
    }).done(function () {
        Highcharts.stockChart('chart', {
            title: { text: 'BTC CHART' },
            rangeSelector: {
                buttons: [
                    { type: 'minute', count: 30, text: '30m' },
                    { type: 'hour', count: 1, text: '1h' },
                    { type: 'hour', count: 2, text: '2h' },
                    { type: 'hour', count: 6, text: '6h' },
                    { type: 'all', count: 1, text: '1d' }
                ],
                selected: 2,
                inputEnabled: true
            },
            plotOptions: {
                candlestick: {
                    downColor: 'blue',
                    upColor: 'red'
                }
            },
            series: [{
                name: 'KRW(원)',
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

/*
* lineDrawer()
* 호출되면 chartDrawer가 구현한 차트의 svg를 수정하여 진입가선을 그린다.
*/
function lineDrawer() {
    var path_d = $('path.highcharts-point').last().attr('d');
    var value1 = path_d.split(' ')[1];
    var value2 = path_d.split(' ')[7];
    path_d = path_d.replace(value1, '0').replace(value1, '0');
    path_d = path_d.replace(value2, '2000').replace(value2, '2000');

    $('path.highcharts-point').last().attr({
        'fill': 'magenta',
        'stroke-width': '1',
        'opacity': '0.3',
        'd': path_d
    });
}

/*
* rbchecker()
* pcp를 기준으로 여러가지 노드들의 css 속성을 빨강 또는 파랑으로 바꾼다.
* @prarm {number} pcp 전일종가 - 실시간종가
*/
function rbchecker(pcp) {
    if (pcp > 0) {
        $('#diff_pcp').css('background-color', 'red');
        $('.coin_price').css('color', 'red');
    }
    else {
        $('#diff_pcp').css('background-color', 'blue');
        $('.coin_price').css('color', 'blue');
    }
}

/*
* getCoinNews()
* 네이버 뉴스 api를 받아와서 html코드를 문자열로 만들고 반복문을 돌며 원하는 만큼 뉴스 컨테이너에 append해준다.
*/
function getCoinNews() {
    $.getJSON('http://localhost:3000/naver-news-api', (data) => {
        var newsData = JSON.parse(data);

        for (let i = 1; i <= 10; i++) {
            var newsContent = '<a target="_blank" href = "' + newsData.items[i - 1].link + '"><h2 class="news_title">' + newsData.items[i - 1].title
                + '</h2><div class="news_description">' + newsData.items[i - 1].description + '</div></a>'
                + '<div class = news_date>' + newsData.items[i - 1].pubDate + '</div>'

            $('.container').append('<div class="news cell' + i + '"></div>');
            $('.cell' + i).html(newsContent);
        }
    });
}

/*
* viewOtherCoins()
* tradingview 의 임베디드 코드를 원하는 코인에 맞게 편집하여 html코드를 만들고, 삽입한다.
*/
function viewOtherCoins() {
    var coins = ['BTC', 'ETH', 'XRP', 'ETC', 'EOS', 'ADA'];
    var widget = [];
    var wid_url = ['<div class="tradingview-widget-container"><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>{"symbol": "BITHUMB:'
        , 'KRW","width": 400,"height": 180,"locale": "kr","dateRange": "3M","colorTheme": "light","trendLineColor": "#37a6ef","underLineColor": "#E3F2FD","isTransparent": false,"autosize": false,"largeChartUrl": ""}</script></div>'];

    for (let i = 0; i < 6; i++) {
        widget[i] = wid_url[0] + coins[i] + wid_url[1];
        $('#other_coin').append(widget[i]);
    }
}

/*
* orderCheckerOfBuy()
* 매수창의 매수 방법에 따라 지정가의 placeholder를 활성화 여부를 바꾸고, 거래 price를 조정한다.
*/
function orderCheckerOfBuy() {
    if ($('#buy .order').is(":checked")) {
        $('#buy .order_field').removeAttr('disabled');
        price = $('#buy .order_field').val();
    } else {
        $('#buy .order_field').attr('disabled', 'disabled');
    }
}

/*
* orderCheckerOfSell()
* 매도창의 매도 방법에 따라 지정가의 placeholder를 활성화 여부를 바꾸고, 거래 price를 조정한다.
*/
function orderCheckerOfSell() {
    if ($('#sell .order').is(":checked")) {
        $('#sell .order_field').removeAttr('disabled');
        price = $('#sell .order_field').val();
    } else {
        $('#sell .order_field').attr('disabled', 'disabled');
    }
}

/*
* buyCoin(), sellCoin()
* 주문수량 칸의 값을 가져와 올바른 값을 입력하였는지 확인하고 entry를 정해준다. 거래를 시작하며 밑의 2개함수를 호출
*/
function buyCoin() {
    if ($('#buy .order_quantitiy').val() <= 0) {
        alert('주문 수량을 입력해주세요!');
        $('#buy .order_quantitiy').focus();
        return;
    }

    if ($('#buy .order').is(":checked")) {
        var price = $('#buy .order_field').val();
        entry = $('#buy .order_quantitiy').val() * price;
    } else {
        entry = $('#buy .order_quantitiy').val() * realtime;
    }
    mycoin += $('#buy .order_quantitiy').val();

    $('#buy .order_quantitiy').val('');
    displayEntryPrice();
    lineDrawer();
}

function sellCoin() {
    if ($('#sell .order_quantitiy').val() <= 0) {
        alert('매도 수량을 입력해주세요!');
        $('#sell .order_quantitiy').focus();
        return;
    }
    if ($('#sell .order').is(":checked")) {
        var price = $('#sell .order_field').val();
    } else {
        $('#sell .order_quantitiy').val() * realtime;
    }
    $('#sell .order_quantitiy').val('');
}

/*
* displayEntryPrice()
* 반복적으로 호출되며 실시간 수익 표시바를 동적으로 표시. 수익률에 따라 노드의 html값과 css속성을 수정.
*/
function displayEntryPrice() {
    $('#real_price_bar .init').css('display', 'none');

    var diff = (realtime * mycoin - entry) / (realtime * mycoin) * 100;
    if (diff > 0) {
        $('#real_price_bar').css('border-bottom', '5px solid red');
        $('#coin_diff').css('color', 'red');
        $('#coin_diff_price').css('color', 'red');
    } else if (!diff) {
        $('#real_price_bar').css('border-bottom', '5px solid rgba(240, 240, 240, 0.945)');
        $('#coin_diff').css('color', 'grey');
        $('#coin_diff_price').css('color', 'grey');
    } else {
        $('#real_price_bar').css('border-bottom', '5px solid blue');
        $('#coin_diff').css('color', 'blue');
        $('#coin_diff_price').css('color', 'blue');
    }
    
    $('#entry_price').html(numberWithCommas((entry / mycoin).toFixed()) + ' KRW');
    $('#coin_diff').html(diff.toFixed(3) + ' %');
    $('#coin_diff_price').html(numberWithCommas((diff * realtime).toFixed()) + ' KRW');

    variometer();
    lineDrawer();
    setTimeout("displayEntryPrice()", 500);
}


/*
* modalOn(), modalOn2()
* 매수, 매도 버튼을 눌렀을 때 호출되며 거래 정보를 띄어주고 한번 더 확인시켜준다.
*/
function modalOn() {
    $('#modal .entry').html(numberWithCommas(realtime.toFixed()) + ' KRW');
    $('#modal .quantity').html($('#buy .order_quantitiy').val() + ' 개');
    $('#modal .total').html(numberWithCommas(realtime * $('#buy .order_quantitiy').val()) + ' KRW');
    $('#modal').modal('show');
}
function modalOn2() {
    $('#modal2 .entry').html(numberWithCommas(realtime.toFixed()) + ' KRW');
    $('#modal2 .quantity').html($('#sell .order_quantitiy').val() + ' 개');
    $('#modal2 .total').html(numberWithCommas(realtime * $('#sell .order_quantitiy').val()) + ' KRW');
    $('#modal2').modal('show');
}

/*
* gotoUp()
* gototop 버튼을 누르면 실행되며 부드럽게 최상단으로 스크롤한다.
*/
function gotoUp() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/*
* proc(), proc2()
* 실시간 가격 정보나 차트와 같이 반복 호출이 필요한 함수들을 반복 호출
*/
function proc() {
    bithumb();
    setTimeout("proc()", 500);
}
function proc2() {
    getExchange(chartDrawer);
    setTimeout("proc2()", 100000);

}

/*
* variometer()
* 실시간 가격 변동을 화면과 오디오에 출력한다. 바로 전에 호출한 실가기준으로 소리와, 가격차이를 출력.
*/
function variometer() {
    var diff = realtime - for_realtime;

    if (!diff) {
        if (beep) audio_mid.play();

    } else if (diff > 0) {
        if (beep) {
            if (diff < 20000) audio_up.play();
            else audio_high.play();
        }
        $('#diff > i').attr('class', 'caret up icon');
        $('#diff > i').css('color', 'red');
        $('#diff > span').html(numberWithCommas(diff.toFixed()) + '원');
        $('#diff > span').css('color', 'red');
    } else {
        if (beep) {
            if (diff > -20000) audio_down.play();
            else audio_low.play();
        }
        $('#diff > i').attr('class', 'caret down icon');
        $('#diff > i').css('color', 'blue');
        $('#diff > span').html(numberWithCommas((-diff).toFixed()) + '원');
        $('#diff > span').css('color', 'blue');
    }
}

/*
* soundOnOff()
* sound 속성을 beep sound 버튼을 클릭함에 따라 ON 또는 OFF로 바꿈. 그에 맞게 beep도 바꾼다.
*/
function soundOnOff() {
    if ($('#audio_button > div.button').attr('sound') == "ON") {
        beep = false;
        $('#audio_button > div.button').attr('sound', 'OFF');
        $('#audio_button i.volume').attr('class', 'volume off icon');
    } else {
        beep = true;
        $('#audio_button > div.button').attr('sound', 'ON');
        $('#audio_button i.volume').attr('class', 'volume up icon');
    }
}

// 제이쿼리 실행문
$(document).ready(function () {
    viewOtherCoins();
    lineDrawer();
    buyCoin();
    orderCheckerOfSell();
    orderCheckerOfBuy();
});
