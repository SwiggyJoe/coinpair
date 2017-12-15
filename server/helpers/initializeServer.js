  "use strict";

  const Server      = require ('../server')

  module.exports = class initializeServerHelpers extends Server {
    constructor(){
      super()
    }

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
        let i = 1.75
        Object.keys(this.exchanges[exchange].skunkMarkets).forEach((market) => {
          this.markets = this.markets + 1

          if(this.exchanges[exchange].hasFetchOHLCV){
            Object.keys(this.exchanges[exchange].timeframes).forEach((timeframe) => {
              i++
               setTimeout(() => {
                  this._execLoadSkunkDataOHLCV(exchange, market, timeframe)
               }, this.exchanges[exchange].rateLimit*i)
            })

          }
          else if(this.exchanges[exchange].hasFetchTickers){
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
        total : this.markets,
        callback: function () {
          log.bright.green("[SERVER] Loaded all market data")
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

              let oldExchangeObject = this.exchanges
              oldExchangeObject[exchange].skunkMarkets[market][timeframe] = ohlcv
              //console.log(exchange+" : "+market+" : "+ohlcv[0][4] + " " + marketObject.quote + " [ "+ timeframe + " ]")
              this.bar.tick();
            }

        }
        catch(e) {
          this._catchEExchange(e)
        }
      }) ()
    }

  }
