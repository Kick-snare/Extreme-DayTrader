$.ajaxSetup({cache:false});

var entry = 0;
var realtime = 0;
var for_realtime = 0;
var mycoin = 0;
var beep = true;
var audio_mid = new Audio('../sound/mid.mp3');
var audio_up = new Audio('../sound/up.mp3');
var audio_down = new Audio('../sound/down.mp3');
var audio_high = new Audio('../sound/high.mp3');
var audio_low = new Audio('../sound/low.mp3');


function getExchange(callback){
    $.get('http://localhost:3000/exchange-api',(data) => {
        var exchangeData = JSON.parse(data);
        var splitedEX = exchangeData[22].ttb.split(',');
        var USD2KRW = parseFloat(splitedEX[0] + splitedEX[1]).toFixed(2);
        callback(USD2KRW);
    });
}

function chartDrawer(usd2krw){
    var chartdata = [];
    $.getJSON('http://localhost:3000/poloniex-api', (data) => {
        var chartapi = JSON.parse(data);
        $.each(chartapi, (i, item) => {
            chartdata.push([item.date*1000, usd2krw*item.open , 
                usd2krw*item.high, usd2krw*item.low, usd2krw*item.close]);
            // console.log('usd : ' + item.open + ', krw : ' + usd2krw*item.open);
        });
    }).done(function(){
        Highcharts.stockChart('chart',{
            title: { text: 'BTC CHART'},
            rangeSelector: {
                buttons: [
                    {type: 'minute',count: 30,text: '30m'},
                    {type: 'hour',count: 1,text: '1h'},
                    {type: 'hour',count: 2,text: '2h'},
                    {type: 'hour',count: 6,text: '6h'},
                    {type: 'all',count: 1,text: '1d'}
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

function lineDrawer(){
    var path_d = $('path.highcharts-point').last().attr('d');
    var value1 = path_d.split(' ')[1];
    var value2 = path_d.split(' ')[7];
    path_d = path_d.replace(value1 , '0').replace(value1 , '0');
    path_d = path_d.replace(value2 , '1000').replace(value2 , '1000');

    $('path.highcharts-point').last().attr({
        'fill':'magenta', 
        'stroke-width' : '1',
        'opacity' : '0.3', 
        'd': path_d
        });
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function rbchecker(pcp){
    if(pcp > 0) {
        $('#diff_pcp').css('background-color','red');
        $('.coin_price').css('color','red');
        // $('#real_price_bar').css('border-bottom','5px solid red');
    }
    else {
        $('#diff_pcp').css('background-color','blue');
        $('.coin_price').css('color','blue');
        // $('#real_price_bar').css('border-bottom','5px solid blue');
    }
}

function bithumb(){
    $.get('http://localhost:3000/bithumb-api', function(data) {
        var btc = JSON.parse(data);
        for_realtime = realtime;
        realtime = parseFloat(btc.data['closing_price']);
        var btc_max_price = parseFloat(btc.data['max_price']);
        var btc_min_price = parseFloat(btc.data['min_price']);
        var btc_24H = (+btc.data['units_traded_24H']).toFixed(2);
        var btc_24H_acc = ((btc.data['acc_trade_value_24H'])/100000000).toFixed(2);
        var btc_pcp = +(btc.data['prev_closing_price']);
        var btc_diff = (realtime - btc_pcp) / btc_pcp * 100;
        $('.coin_price').html(numberWithCommas(realtime)+' KRW');
        $('#coin_price_real').html(numberWithCommas(realtime)+' KRW');
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
            var newsContent = '<a target="_blank" href = "' + newsData.items[i-1].link + '"><h2 class="news_title">' + newsData.items[i-1].title 
            + '</h2><div class="news_description">' + newsData.items[i-1].description + '</div></a>'
            + '<div class = news_date>' + newsData.items[i-1].pubDate + '</div>'
            
            $('.container').append('<div class="news cell' + i + '"></div>');
            $('.cell' + i).html(newsContent);
        }
    });
}

function viewOtherCoins(){
    var coins = ['BTC', 'ETH', 'XRP', 'ETC', 'EOS', 'ADA'];
    var widget = [];
    var wid_url = ['<div class="tradingview-widget-container"><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>{"symbol": "BITHUMB:'
    ,'KRW","width": 400,"height": 180,"locale": "kr","dateRange": "3M","colorTheme": "light","trendLineColor": "#37a6ef","underLineColor": "#E3F2FD","isTransparent": false,"autosize": false,"largeChartUrl": ""}</script></div>'];
    
    for(let i=0;i<6;i++){
        widget[i] =  wid_url[0] + coins[i] + wid_url[1];
        $('#other_coin').append(widget[i]);
    }
}

function orderCheckerOfBuy(){
    
    if($('#buy .order').is(":checked")){
        console.log('지정가 매수');
        $('#buy .order_field').removeAttr('disabled');
        price = $('#buy .order_field').val();
        
    } else{
        console.log('시장가 매수');
        $('#buy .order_field').attr('disabled','disabled');
    }    
}

function orderCheckerOfSell(){

    if($('#sell .order').is(":checked")){
        console.log('지정가  매도');
        $('#sell .order_field').removeAttr('disabled');
        price = $('#sell .order_field').val();
        
    } else{
        console.log('시장가  매도');
        $('#sell .order_field').attr('disabled','disabled');
    }    
}

function buyCoin(){
    if($('#buy .order_quantitiy').val() <= 0) {
        alert('주문 수량을 입력해주세요!');
        $('#buy .order_quantitiy').focus();
        return;
    }
    
    if($('#buy .order').is(":checked")){
        var price = $('#buy .order_field').val();
        entry = $('#buy .order_quantitiy').val() * price;
    } else{
        entry = $('#buy .order_quantitiy').val() * realtime;
    }
    mycoin += $('#buy .order_quantitiy').val();

    $('#buy .order_quantitiy').val('');
    displayEntryPrice();
    lineDrawer();
}

    
function sellCoin(){
    if($('#sell .order_quantitiy').val() <= 0) {
        alert('매도 수량을 입력해주세요!');
        $('#sell .order_quantitiy').focus();
        return;
    }

    if($('#sell .order').is(":checked")){
        var price = $('#sell .order_field').val();
        // entry = $('#sell .order_quantitiy').val() * price;
    } else{
        $('#sell .order_quantitiy').val() * realtime;
        // entry = $('#sell .order_quantitiy').val() * realtime;
    }
    // mycoin -= $('#sell .order_quantitiy').val();
    $('#sell .order_quantitiy').val('');
}

function modalOn(){
    $('#modal .entry').html(numberWithCommas(realtime.toFixed()) + ' KRW');
    $('#modal .quantity').html($('#buy .order_quantitiy').val() + ' 개');
    $('#modal .total').html(numberWithCommas(realtime * $('#buy .order_quantitiy').val()) + ' KRW');
    $('#modal').modal('show');
}

function modalOn2(){
    $('#modal2 .entry').html(numberWithCommas(realtime.toFixed()) + ' KRW');
    $('#modal2 .quantity').html($('#sell .order_quantitiy').val() + ' 개');
    $('#modal2 .total').html(numberWithCommas(realtime * $('#sell .order_quantitiy').val()) + ' KRW');
    $('#modal2').modal('show');
}

function displayEntryPrice() {
    $('#real_price_bar .init').css('display','none');

    var diff = (realtime*mycoin-entry)/(realtime*mycoin) * 100; 
    if(diff>0){
        $('#real_price_bar').css('border-bottom','5px solid red');
        $('#coin_diff').css('color','red');
        $('#coin_diff_price').css('color','red');
    } else if(!diff){
        $('#real_price_bar').css('border-bottom','5px solid rgba(240, 240, 240, 0.945)' );
        $('#coin_diff').css('color','grey');
        $('#coin_diff_price').css('color','grey');
    } else{
        $('#real_price_bar').css('border-bottom','5px solid blue');
        $('#coin_diff').css('color','blue');
        $('#coin_diff_price').css('color','blue');
    }
    $('#entry_price').html(numberWithCommas((entry/mycoin).toFixed()) + ' KRW');
    $('#coin_diff').html(diff.toFixed(3)+ ' %');
    $('#coin_diff_price').html(numberWithCommas((diff*realtime).toFixed())+ ' KRW');
    variometer();
    setTimeout("displayEntryPrice()", 500);
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
    getExchange(chartDrawer);
    setTimeout("proc2()", 1000000);

}

function variometer(){
    
    var diff = realtime - for_realtime;
    if(!diff){
        if(beep) {
            audio_mid.play();
        }
        $('#diff > i').attr('class','sort icon');
        $('#diff > i').css('color','grey');
        $('#diff > span').html('-----');
        $('#diff > span').css('color','grey');
        
    } else if(diff > 0){
        if(beep){
            if(diff < 20000) audio_up.play();
            else audio_high.play();
        }
        $('#diff > i').attr('class','caret up icon');
        $('#diff > i').css('color','red');
        $('#diff > span').html(numberWithCommas(diff.toFixed()));
        $('#diff > span').css('color','red');
    } else {
        if(beep){
            if(diff > -20000) audio_down.play();
            else audio_low.play();
        }
        $('#diff > i').attr('class','caret down icon');
        $('#diff > i').css('color','blue');
        $('#diff > span').html(numberWithCommas((-diff).toFixed()));
        $('#diff > span').css('color','blue');
    }
}

function soundOnOff(){
    if($('#audio_button > div.button').attr('sound') == "ON"){
        beep = false;
        $('#audio_button > div.button').attr('sound','OFF');
        $('#audio_button i.volume').attr('class','volume off icon');
    } else{
        beep = true;
        $('#audio_button > div.button').attr('sound','ON');
        $('#audio_button i.volume').attr('class','volume up icon');
    }
}

$(document).ready(function(){
    viewOtherCoins();
    lineDrawer();
    buyCoin();
    orderCheckerOfSell();
    orderCheckerOfBuy();
}); 
