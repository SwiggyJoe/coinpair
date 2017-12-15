  "use strict";

  // ____________________________________________ \\
  // Import alls the Stuff
  // ____________________________________________ \\

  // Important sever libs
  const io        = require('socket.io')('')                          // SocketIO-Server
  const ccxt      = require ('ccxt')                                  // Crypto Plugin
  const moment    = require('moment')                                 // Formatting time
  const r         = require('rethinkdb')                              // Databse

  // Enhance the Log
  const asTable   = require ('as-table')                              // Create Tables in Log
  const log       = require ('ololog').configure ({ locate: false })  // A better Log
  require ('ansicolor').nice                                          // I don't know why dis

  // Import own classes
  const Server      = require ('./server/server')

  // ____________________________________________ \\
  // Declare all Variables
  // ____________________________________________ \\

  // SocketIO
  const port = 8000

  // server class
  const server = new Server()

  // Coin Object
  let coins = []

  // cryptocompare


  // ////////
  // Important declaring
  // ////////
  // Colors in Log:
  //  RED: Errors, Important things
  //  CYAN: Server Message
  //  GREEN: Sending out a message
  //  WHITE: For test things
  //  MAGENTA: SocketIO
  //  BLUE: Loading things

  // ____________________________________________ \\
  // Do requiered stuff like connecting with Socket & Databse
  // ____________________________________________ \\

  function initialize_server(){

    //Start Message
    log.bright.cyan('[SERVER] Starting the server..')

    // Starting SocketIO connection
    io.listen(port)
    log.bright.magenta('[IO] Listening on port ', port)

    // Because of restart - start filling the coin object [coins]
    log.bright.cyan('[SERVER] Start grabbing informations..')

    server.addIO(io)
    server.start()

    io.on('connection', (socket) => {

      log.bright.magenta('[IO] New user connection')
      server.addSocket(socket)

      if(server.ready){

        let newConnData = server.getNewConnGeneralMarketData()
        socket.emit("newConnGMData", newConnData)

        let newCoinData =  server.getSimpleCoinData();
        socket.emit("newConnSimpleCoinData", newCoinData)

        socket.on('getCoinDetails', (data) => {
          server.getChartData(data.coinID).then((dataChart) => {
            socket.emit('callbackChart', dataChart)
          })

          socket.emit("newConnSimpleCoinData", newCoinData)
          console.log("GOT IT "+ JSON.stringify(data))
        })

      }

    })

    setInterval(() => {
      let newConnData = server.getNewConnGeneralMarketData()
      io.emit("newConnGMData", newConnData)

      let newCoinData =  server.getSimpleCoinData();
      io.emit("newConnSimpleCoinData", newCoinData)
    },10000)

  }

  // initialize the server here
  initialize_server()
