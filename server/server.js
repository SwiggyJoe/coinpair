  "use strict";

  const ccxt        = require ('ccxt')                                  // Crypto Plugin
  const log         = require ('ololog').configure ({ locate: false })  // A better Log
  const ProgressBar = require('ascii-progress')                         // ProgressBar
  const axios       = require('axios')
  var moment = require('moment');

  global.fetch = require('node-fetch')

  const coinmarketcap = require('coinmarketcap')
  const tickerKeys = [
  'id',
  'name',
  'symbol',
  'rank',
  'price_usd',
  'price_btc',
  '24h_volume_usd',
  'market_cap_usd',
  'available_supply',
  'total_supply',
  'percent_change_1h',
  'percent_change_24h',
  'percent_change_7d',
  'last_updated',
  'price_eur',
  'volume_eur',
  'market_cap_eur'
]

  process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
  process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

  // Class Extensions
  //const initializeServerHelpers          = require ('./helpers/initializeServer')

  module.exports = class Server {
      constructor(){
        this.supportedExchanges = ['gdax']
        //this.neededTimeframes   = ['1m','5m','15m','1h','4h','1d']
        this.neededTimeframes   = ['1h']
        this.socket             = []
        this.io                 = {}
        this.exchanges          = {}
        this.markets            = 0
        this.marketTimeframes   = 0
        this.bar
        this.ready              = false

        this.marketTimeframeData = {}

        this.testData = {}

        this.generalMarketData = {}
        this.coinDataSimple = {}

      }

      addIO(io){
        this.io = io
        log.bright.magenta('[IO] IO Set up')
      }
      addSocket(socket){
        this.socket = socket;
        log.bright.magenta('[IO] Socket is active')
      }
      async getChartData(id, timeframe){
        let sendData = {}, priceArray = [], volumeArray = [], labelArray = [];
        let startDate, endDate;

        if(timeframe == "HOUR"){
          startDate = moment().subtract(1,'h').unix()*1000
          endDate = moment().unix()*1000
        }
        if(timeframe == "DAY"){
          startDate = moment().subtract(1,'d').unix()*1000
          endDate = moment().unix()*1000
        }
        if(timeframe == "WEEK"){
          startDate = moment().subtract(1,'w').unix()*1000
          endDate = moment().unix()*1000
        }
        if(timeframe == "MONTH"){
          startDate = moment().subtract(1,'M').unix()*1000
          endDate = moment().unix()*1000
        }
        if(timeframe == "YEAR"){
          startDate = moment().subtract(1,'y').unix()*1000
          endDate = moment().unix()*1000
        }

        const dataArray = {
          labels: labelArray,
          datasets: [{
              label: 'Bitcoin',
              type:'line',
              data: priceArray,
              fill: false,
              borderColor: '#EC932F',
              backgroundColor: '#EC932F',
              pointBorderColor: '#EC932F',
              pointBackgroundColor: '#EC932F',
              pointHoverBackgroundColor: '#EC932F',
              pointHoverBorderColor: '#EC932F',
              pointHoverRadius: 0,
              pointHitRadius: 0,
              yAxisID: 'y-axis-2',
              pointRadius: 0,
            },{
              label: 'Volume',
              data: volumeArray,
              fill: true,
              backgroundColor: '#cdccd2',
              borderColor: '#cdccd2',
              hoverBackgroundColor: '#a3a2a7',
              hoverBorderColor: '#cdccd2',
              yAxisID: 'y-axis-1',
              pointRadius: 0,
            }]
        };

        let promise = new Promise((resolve, reject) => {

          axios.get('https://graphs.coinmarketcap.com/currencies/'+id+'/'+startDate+'/'+endDate)
          .then((data) => {
            let count = 0;

            for(let i = 0; i < data.data.price_usd.length; i++){
              priceArray.push(data.data['price_usd'][i][1])
              volumeArray.push(data.data['volume_usd'][i][1])
              count++
              let date = data.data['price_usd'][i][0]/1000

              labelArray.push(moment.unix(date).add(2,'h').format("DD. MMM | H:mm"));
            }

            dataArray.datasets[0].data = priceArray;
            dataArray.datasets[1].data = volumeArray;
            dataArray.labels = labelArray;
            dataArray.datasets[0].label = id;

            sendData = {
              data: dataArray,
              chartLoaded: true,
            }

            priceArray = [];
            volumeArray = [];
            labelArray = [];

            log.bright.red('Loaded Grap: [' +  id +']');


            resolve(sendData)

          })

        })

        return promise;

      }

      start(){
        // Server Start should initialize Exchanges & Markets and put these
        // into the [this.exchanges].object & into [this.markets].array
        /*this._loadSupportedExchanges()
        this._addSkunkMarketsToExchanges()*/

        /*this._loadTestData()
        this.exchanges = this.testData
        log.bright.white("Grabbing finished, Test Data Loaded")

        this._finishedInitializing()*/

        this._loadGeneralMarketData()
        this._loadCoinData()

        setInterval(() => {
          this._loadGeneralMarketData()
          this._loadCoinData()
        }, 10000)

      }

      getNewConnGeneralMarketData(){
        log.bright.green("[SEND] Sended General Market Data to Socket.")
        return this.generalMarketData
      }

      _loadGeneralMarketData(){

        this._loadCMCGeneralMarketData().then((result) =>{
          log.bright.cyan("[SERVER] Ready")
          this.ready = true
          this.generalMarketData = result
        })

      }

      async _loadCMCGeneralMarketData(){
        try{
        log.bright.lightBlue("[SERVER] LoadCMC Coin General Market Data")
        const data = await coinmarketcap.globalMarket()
        return data
        }
        catch(e){
          console.log(e)
        }
      }

      getSimpleCoinData(){
        log.bright.green("[SEND] Sended Simple Coin Data to Socket.")
        return this.coinDataSimple
      }

      _loadCoinData(){
          this._loadCMCcoins(1375, "USD").then((result) => {
            this.coinDataSimple = result
          })
      }

      async _loadCMCcoins(limit, convert){
        try{
        log.bright.lightBlue("[SERVER] LoadCMC Coin Data")
        const data = await coinmarketcap.ticker({
          limit,
          convert
        })
        return data;
      }
        catch(e){
          console.log(e)
        }
      }














      // Create coin data Obj [coinDataSimple].obj for front page
      _createCoinDataSimple(){
        let coinObjectSimpleStandard  = {
          indexNumber:    -1,
          id:             '',
          currentPrice:   -1,
          volume_24h:     -1,
          gain_1h:        -1,
          gain_24h:       -1,
          gain_7d:        -1,
          rank:           -1,
          coinSupply:     -1,
          maxCoinSupply:  -1,
          marketCap:      -1
        }
        let coinDataSimpleArray       = []

        let volume = 0

        Object.keys(this.exchanges).forEach((exchange) => {


          Object.keys(this.exchanges[exchange].skunkMarkets).forEach((market) => {
            Object.keys(this.exchanges[exchange].skunkMarkets[market].timeframes).forEach((timeframe) => {


              let timeframeShort = this.exchanges[exchange].skunkMarkets[market].timeframes[timeframe]

              for (let i = 0; i < 24; i++){
                volume += timeframeShort[i][5]
              }
              let quote = this.exchanges[exchange].skunkMarkets[market].quote

              console.log("Market: "+ market+ " Volume24h: "+ volume.toLocaleString(undefined,{ minimumFractionDigits: 2 }) + " " + quote )
              volume = 0
            })
          })
        })

        log.bright.white(volume)

      }

      // initialize the Server functions
      _catchEExchange(e){
        if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
            log.bright.red ('[DDoS Protection] ' + e.message)
        } else if (e instanceof ccxt.RequestTimeout) {
            log.bright.red ('[Request Timeout] ' + e.message)
        } else if (e instanceof ccxt.AuthenticationError) {
            log.bright.red ('[Authentication Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeNotAvailable) {
            log.bright.red ('[Exchange Not Available Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeError) {
            log.bright.red ('[Exchange Error] ' + e.message)
        } else if (e instanceof ccxt.NetworkError) {
            log.bright.red ('[Network Error] ' + e.message)
        } else {
            throw e;
        }
      }

      _loadSupportedExchanges(){

        // Load Exchanges Data for supported Exchanged in [this.exchanges].object
        log.bright.cyan('[SERVER] Beginning with loading exchanges')
        for (let i = 0; i < this.supportedExchanges.length; i++){
          let newExchange = new (ccxt)[this.supportedExchanges[i]] ()

          if(typeof(newExchange) !== "undefined")
          {
            this.exchanges[this.supportedExchanges[i]] = newExchange
          }
        }
        log.bright.cyan('[SERVER] Loaded all exchanges');

      }

      _addSkunkMarketsToExchanges(){

        async function loadMarkets (exchangesProp, supportedExchanges) {
          try{
            log.bright.cyan('[SERVER] Beginning with loading markets')

            // Create an Empty Markts Object
            let marketsObj = []

            // Do this for every supported Exchange
            for(let i = 0; i < supportedExchanges.length; i++ ){

              // Get exchange ID's
              let exchangeIDs = []
              Object.keys(exchangesProp).forEach(function (exchange) {
                 exchangeIDs.push(exchange);
              })
              let exchange = new ccxt [exchangeIDs[i]]
              // Load all markets of current exchange and push them into [marketsObj].array
              let markets = await exchange.loadMarkets ()
              //marketsObj.push(markets)

              // Put a property in all this.exchange with supported markets
              let skunkMarkets                            = markets //Object.keys( marketsObj[i] )
              exchangesProp[exchangeIDs[i]].skunkMarkets  = skunkMarkets

              //console.log(exchangesProp[i].id +" : " + skunkMarkets);
              //console.log(marketsObj)
            }

            log.bright.cyan('[SERVER] Finished with loading markets')
            log.bright.cyan('[SERVER] Starting loading prices of markets')
            //console.log(JSON.stringify(exchangesProp))
            return exchangesProp;

          }
          // Catch Errors
          catch(e){
            if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
                log.bright.red ('[DDoS Protection] ' + e.message)
            } else if (e instanceof ccxt.RequestTimeout) {
                log.bright.red ('[Request Timeout] ' + e.message)
            } else if (e instanceof ccxt.AuthenticationError) {
                log.bright.red ('[Authentication Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                log.bright.red ('[Exchange Not Available Error] ' + e.message)
            } else if (e instanceof ccxt.ExchangeError) {
                log.bright.red ('[Exchange Error] ' + e.message)
            } else if (e instanceof ccxt.NetworkError) {
                log.bright.red ('[Network Error] ' + e.message)
            } else {
                throw e;
            }
          }
        }

        loadMarkets(this.exchanges, this.supportedExchanges).then((result) => {
          this._initDataForSkunkMarkets(result)
        })

      }

      _initDataForSkunkMarkets(result){

        this.exchanges = result

        Object.keys(this.exchanges).forEach((exchange) => {
          // How often repeat request at rate limit
          let i = 1

          this.marketTimeframeData[exchange] = {}
          this.marketTimeframeData[exchange].markets = {}

          Object.keys(this.exchanges[exchange].skunkMarkets).forEach((market) => {

            this.markets = this.markets + 1
            if(this.exchanges[exchange].hasFetchOHLCV){

              this.marketTimeframeData[exchange].markets[market] = {}
              this.marketTimeframeData[exchange].markets[market].timeframes = {}

              Object.keys(this.exchanges[exchange].timeframes).forEach((timeframe) => {
                i++

                if(this.neededTimeframes.indexOf(timeframe) > -1){
                  this.marketTimeframes++
                  setTimeout(() => {
                     this._execLoadSkunkDataOHLCV(exchange, market, timeframe)
                  }, this.exchanges[exchange].rateLimit*i)
                }

              })

            }
            else if(this.exchanges[exchange].hasFetchTickers){
              this.marketTimeframes++
              i++
              setTimeout(() => {
                 this._execLoadSkunkDataTicker(exchange, market)
              }, this.exchanges[exchange].rateLimit*i)

            }
          })
        })
        //log.bright.cyan("[SEVRER] Finished loading prices of markets")
        //log.bright.white(JSON.stringify(this.exchanges))

        this.bar = new ProgressBar({
          clean   : true,
          schema  : ' [:bar] \n:current/:total',
          total : this.marketTimeframes,
          callback: () => {
            log.bright.green("[SERVER] Loaded all market data")
            this._finishedInitializing()
          }
        })
      }

      _execLoadSkunkDataTicker(exchange, market){
        (async () => {
          try {
            let exchangeObject  = this.exchanges[exchange]
            let marketObject    = this.exchanges[exchange].skunkMarkets[market]

              if(exchangeObject.hasFetchTickers){
                const ticker = await exchangeObject.fetchTicker (market)
                /*log (exchange +" / "+ market + " / "
                + ticker['datetime'] +
                'high: '    + ticker['high'],
                'low: '     + ticker['low'],
                'bid: '     + ticker['bid'],
                'ask: '     + ticker['ask'],
                'volume: '  + ticker['baseVolume'])*/
              }

              this.bar.tick();

          }
          catch(e) {
            this._catchEExchange(e)
          }
        }) ()
      }

      _execLoadSkunkDataOHLCV(exchange, market, timeframe){
        (async () => {
          try {
            let exchangeObject  = this.exchanges[exchange]
            let marketObject    = this.exchanges[exchange].skunkMarkets[market]

              if(exchangeObject.hasFetchOHLCV){
                const ohlcv = await exchangeObject.fetchOHLCV (market, timeframe)

                marketObject.timeframes = {}
                marketObject.timeframes[timeframe] = ohlcv
                //console.log(exchange+" : "+market+" : "+ohlcv[0][4] + " " + marketObject.quote + " [ "+ timeframe + " ]")

                this.marketTimeframeData[exchange].markets[market].timeframes[timeframe] = {}
                this.marketTimeframeData[exchange].markets[market].timeframes[timeframe] = marketObject.timeframes[timeframe]
              }

          }
          catch(e) {
            this._catchEExchange(e)
          }
        }) ().then(() => {
          this.bar.tick()
        })
      }

      _putTimeframesIntoExchangesObject(){

        Object.keys(this.exchanges).forEach((exchange) => {
          Object.keys(this.exchanges[exchange].skunkMarkets).forEach((market) => {
            this.exchanges[exchange].skunkMarkets[market].timeframes = {}
            Object.keys(this.marketTimeframeData[exchange].markets[market].timeframes).forEach((timeframe) => {
              this.exchanges[exchange].skunkMarkets[market].timeframes[timeframe] = this.marketTimeframeData[exchange].markets[market].timeframes[timeframe]
            })
          })
        })
      }

      _finishedInitializing(){
        //*************************this._putTimeframesIntoExchangesObject()

        this.ready = true
        log.bright.cyan("[SERVER] Finished starting up the server")

        this._createCoinDataSimple();
        //console.log(JSON.stringify(this.exchanges))
      }
  };
