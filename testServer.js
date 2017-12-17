
  "use strict";

  // ____________________________________________ \\
  // Import alls the Stuff
  // ____________________________________________ \\

  // Important sever libs
  const io        = require('socket.io')('')                          // SocketIO-Server
  const ccxt      = require ('ccxt')                                  // Crypto Plugin
  const moment    = require('moment')                                 // Formatting time
  const r         = require('rethinkdb')                              // Databse
  const crypto    = require('crypto');

  // Enhance the Log
  const asTable   = require ('as-table')                              // Create Tables in Log
  const log       = require ('ololog').configure ({ locate: false })  // A better Log
  require ('ansicolor').nice

  // Import own classes
  const Server      = require ('./server/server')

  // ____________________________________________ \\
  // Declare all Variables
  // ____________________________________________ \\

  // server class
  const server = new Server()

  function pre (datum) { return "[" + moment(datum).format('D-M-Y HH:mm:ss') + "]"}

  // SocketIO
  const port = 8000

  // Object with all information about coins
  // !!!!!!!!!!! DO NOT SEND THIS TO CLIENT !!!!!!!!!!!!!!!!
  let allCoinObject = []
  let allUserObject = {}

  // RethingDB Connection variable
  let connection = null
  let timer;

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

  log.bright.cyan(pre(new Date)+"[SERVER] Start connecting with Database..")

  r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
      if (err) throw err
      connection = conn

      log.bright.cyan(pre(new Date)+"[SERVER] Database succesfully connected.")
      log.bright.cyan(pre(new Date)+"[SERVER] Start initalize the main Server..")

      // initialize the server here when DB is connected
      initialize_server()

  })

  function createPasswordHash(passwordToEncrypt){
    var algorithm = 'aes256'
    var key = 'TKdj312kRIGTfXEhK2LDiiKGcxBlMy32N4x1WE8Bkjpw8ffqDjSqrUiFVvYv'
    var text = passwordToEncrypt

    var cipher = crypto.createCipher(algorithm, key)
    var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')

    var decipher = crypto.createDecipher(algorithm, key)
    var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')

    return encrypted;
  }

  function createToken(){
    return crypto.randomBytes(64).toString('hex')
  }

  let user = {
    userID:     1,
    username:   'grudonr',
    mail:       'grudonr@me.com',
    mailVerify: true,
    password:   createPasswordHash('test'),
    lastLogged: null,
    picture:    null,

    rank:       'ADMIN',
    plan:       'UNLIMITED4EVER',
    invite:     'NONEED',

    currency:   'USD',
    theme:      'LIGHT',
    tableSize:  50,

    currentToken: createToken(),
  }

  function checkIfUserExist(username){
    r.db('coinpair').table('users').filter(r.row('username').eq(username)).
    run(connection, function(err, cursor) {
        cursor.toArray(function (err, result){
          if(result.length > 0 && result.length < 2){
            return true;
          }
        })
      });
  }


  function initialize_server(){

    // Starting SocketIO connection
    io.listen(port)
    log.bright.magenta(pre(new Date)+'[IO] Listening on port ', port)

    server.addIO(io)
    server.start()

    io.on('connection', (socket) => {

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

      /// NEW CODE

      log.bright.magenta(pre(new Date)+'[IO] New user connection')

      socket.on('disconnect', function () {
          log.bright.magenta(pre(new Date)+'[IO] User disconnected')
      });

      socket.on('loginAttempt', (data) => {

        clearTimeout(timer)

        let username = data.username
        let password = data.password

        timer = setTimeout(() => {

          log("username: "+ username)
          log("password hash: "+ password)

          r.db('coinpair').table('users').filter(r.row('username').eq(username)).
          run(connection, function(err, cursor) {
              if (err) throw err;

              cursor.toArray(function(err, result) {
                  if (err) throw err;

                  if(result.length > 0 && result.length < 2){
                    if(result[0].password == password){
                      console.log("logged in")
                      let token = createToken()
                      r.db('coinpair').table('users').filter(r.row('username').eq(username)).update({token: token}).
                      run(connection, function(err, result) {
                          if (err) throw err;
                          console.log(JSON.stringify(result, null, 2));
                      });

                      let userObject = result[0]
                        userObject.password = "no"

                      socket.emit('loginCallback', {
                        success: true,
                        token: token,
                        user: userObject,
                      })

                    }
                    else{
                      socket.emit('loginCallback', {success: false,})
                      console.log("wrong password.. try again")
                    }
                  }
                  else{
                    socket.emit('loginCallback', {success: false})
                    console.log("wrong password or username.. try again")
                  }


                  //console.log(JSON.stringify(result, null, 2));
              });
          });

        },1500)

      })

      socket.on('isTokenLegit', (data) => {
        // SECURITY ISSUE
        r.db('coinpair').table('users').filter(r.row('token').eq(data.token)).
        run(connection, function(err, cursor) {
            cursor.toArray(function (err, result){
              if(result.length > 0 && result.length < 2){
                // TOKEN LEGIT SEND THAT TO USER
                let userObject = result[0]
                  userObject.password = "no"

                socket.emit('isTokenLegitCallback', {
                  isLegit: true,
                  user: userObject,
                })
              }
              else{
                socket.emit('isTokenLegitCallback', {
                  isLegit: false,
                })
              }
            })
          });
      })

      socket.on('logoutEvent', (data) => {
        console.log("change token to 0 " + data.token)
        r.db('coinpair').table('users').filter(r.row('token').eq(data.token)).
        run(connection, function(err, cursor) {
            cursor.toArray(function (err, result){
              if(result.length > 0 && result.length < 2){
                r.db('coinpair').table('users').filter(r.row('token').eq(data.token)).update({token: data.token}).
                run(connection, function(err, result) {
                    if (err) throw err;
                    console.log(JSON.stringify(result, null, 2));
                    console.log("Changed")
                });
              }
            })
          })
      })

      socket.on('getPortfolioDetails', (data) => {
          console.log(data.userID)

          // GET ALL PORTFOLIOS OF USER
          r.db('coinpair').table('portfolios').filter(r.row('fromUser').eq(data.userID))
          .run(connection, function(err, cursor) {
            cursor.toArray(function(err, result){
              console.log(result[0])
              socket.emit('newPortfolioData', result[0])
            })
          })
      })

    })

    setInterval(() => {
      let newConnData = server.getNewConnGeneralMarketData()
      io.emit("newConnGMData", newConnData)

      let newCoinData =  server.getSimpleCoinData();
      io.emit("newConnSimpleCoinData", newCoinData)
    },10000)

  }
