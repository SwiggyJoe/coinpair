
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

  // VOTES FOR USER FEATURE
  const leftVotesGlobal = 2

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

  r.connect( {host: '138.197.39.136', port: 28015}, function(err, conn) {
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

  function makeid(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
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
          console.log(data)
          server.getChartData(data.coinID, data.timeframe).then((dataChart) => {
            socket.emit('callbackChart', dataChart)
          })

          socket.emit("newConnSimpleCoinData", newCoinData)
        })

      }

      /// NEW CODE

      log.bright.magenta(pre(new Date)+'[IO] New user connection')

      socket.on('disconnect', function () {
          log.bright.magenta(pre(new Date)+'[IO] User disconnected')
      });

      socket.on('registerAttempt', (data) => {
        clearTimeout(timer)
        let username  = data.username
        let password  = data.password
        let mail      = data.mail
        let key       = data.key.toUpperCase()

        //socket.emit("registerCallback", {data.success: false})

        r.db('coinpair').table('invites').filter(
          r.row("key").eq(key).and(r.row("used").eq(false))
        ).
        run(connection, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result){
            if (err) throw err;
            let l = result.length
            if(Number(l) >= 1){
              // KEY IS AWESOMEEE

              timer = setTimeout(() => {

                r.db('coinpair').table('users').filter(
                  r.row("username").eq(username).or(r.row("details")("mail").eq(mail))
                ).
                run(connection, function(err, cursor) {
                  if (err) throw err;
                  cursor.toArray(function (err, result){
                    if (err) throw err;
                    if(result.length !== 0){
                      // email or username already taken

                    } else{
                      // email and username are free

                      let time = moment().add(1,'months',).unix()
                      let token = {
                        token: createToken(),
                        expire: time
                      }

                      r.db('coinpair').table('users').insert({
                        "details": {
                          "invite": key,
                          "lastLogged": null,
                          "mail": mail,
                          "mailVerify": false,
                          "picture": "/",
                          "plan": "BASE",
                          "rank": "USER",
                          "lastLogin": moment().unix()
                        },
                        "password": password,
                        "settings": {
                          "currency": "USD",
                          "tableSize": 50,
                          "theme": "LIGHT"
                        },
                        "token": [token],
                        "username": username,
                        "createdTime": moment().unix()
                      }).run(connection, function(err, result) {
                          if (err) throw err;
                          let userID = result["generated_keys"][0]

                          // SET KEY TO USED
                          r.db('coinpair').table('invites').filter(r.row('key').eq(key)).update({used: true, userID, timeUsed: moment().unix()}).
                          run(connection, function(err, result) {
                              if (err) throw err;
                          });

                          // CREATE PORTFOLIO
                          r.db('coinpair').table('portfolios').insert({
                            "assetGraph": [],
                            "createdAt": moment().unix(),
                            "fromUser": userID,
                            "positions": []
                          }).run(connection, function(err, result) {
                              if (err) throw err;

                              r.db('coinpair').table('users').filter(r.row('id').eq(userID)).
                              run(connection, function(err, cursor) {
                                  if (err) throw err;
                                  cursor.toArray(function(err, result) {

                                    // FINISH

                                    let userObject = result[0]
                                    userObject.password = ""

                                    socket.emit('registerCallback', {success: true ,errorMsg: '', token: token, user: userObject})

                                    log.white(pre(new Date) + "[USER] "+ username + " registered with ["+key+"]")

                                  })
                                })


                            })

                      })


                    }
                  })
                })

              }, 800)


            }
            else{
              // KEY IS NOT GOOD
              socket.emit('registerCallback', {success: false, errorMsg: 'Key is not valid.'})
            }
          })
        })


      })

      socket.on('loginAttempt', (data) => {

        clearTimeout(timer)

        let username = data.username
        let password = data.password

        timer = setTimeout(() => {

          r.db('coinpair').table('users').filter(r.row('username').eq(username).or(r.row('details')('mail').eq(username))).
          run(connection, function(err, cursor) {
              if (err) throw err;

              cursor.toArray(function(err, result) {
                  if (err) throw err;

                  if(result.length > 0 && result.length < 2){
                    if(result[0].password == password){
                      log.white(pre(new Date) + "[USER] "+ username + " logged in.")
                      let time = moment().add(1,'months',).unix()
                      let token = {
                        token: createToken(),
                        expire: time
                      }
                      let oldTokenArray = result[0].token
                      oldTokenArray.push(token)

                      let oldDetailsObject = result[0].details
                      oldDetailsObject.lastLogin = moment().unix()


                      r.db('coinpair').table('users').filter(r.row('username').eq(username)).update({token: oldTokenArray, details: oldDetailsObject}).
                      run(connection, function(err, result) {
                          if (err) throw err;
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
                    }
                  }
                  else{
                    socket.emit('loginCallback', {success: false})
                  }
              });
          });

        },800)

      })

      socket.on('isTokenLegit', (data) => {
        // SECURITY ISSUE
        r.db('coinpair').table('users').
        filter(
          function(doc) {
              return doc("token").contains(function(token) {
                  return token("token").eq(data.token.token)

              })
          }
        ).
        run(connection, function(err, cursor) {
            cursor.toArray(function (err, result){
              if(result.length > 0 && result.length < 2){

                let newTokenObj = []
                let time = moment().unix()

                for(let i = 0; i < result[0].token.length; i++){
                  if(moment(result[0].token[i].expire).isAfter(time)){
                    newTokenObj.push(result[0].token[i])
                  }
                }

                r.db('coinpair').table('users').filter(r.row('id').eq(result[0].id)).update({token: newTokenObj}).
                run(connection, function(err, result) {
                    if (err) throw err;
                });

                // TOKEN LEGIT SEND THAT TO USER
                let userObject = result[0]
                  userObject.password = "no"
                  userObject.token = []

                socket.emit('isTokenLegitCallback', {
                  isLegit: true,
                  user: userObject,
                })
              }
              else{
                socket.emit('isTokenLegitCallback', {
                  isLegit: false,
                })
                log.bright.red(pre(new Date) + "[USER] Token was not legit.")
              }
            })
          });
      })

      socket.on('logoutEvent', (data) => {
        r.db('coinpair').table('users').filter(
          function(doc) {
              return doc("token").contains(function(token) {
                  return token("token").eq(data.token)

              })
          }
        ).
        run(connection, function(err, cursor) {
            cursor.toArray(function (err, result){
              if(result.length > 0 && result.length < 2){

                let newTokenObj = []
                let time = moment().unix()

                for(let i = 0; i < result[0].token.length; i++){
                  if(moment(result[0].token[i].expire).isAfter(time) && result[0].token[i].token != data.token){
                    newTokenObj.push(result[0].token[i])
                  }
                }

                log.white(pre(new Date) + "[USER] "+result[0].username+" logged out.")

                r.db('coinpair').table('users').filter(r.row('id').eq(result[0].id)).update({token: newTokenObj}).
                run(connection, function(err, result) {
                    if (err) throw err;
                });
              }
            })
          })
      })

      socket.on('getPortfolioDetails', (data) => {
          // GET ALL PORTFOLIOS OF USER
          r.db('coinpair').table('portfolios').filter(r.row('fromUser').eq(data.userID))
          .run(connection, function(err, cursor) {
            cursor.toArray(function(err, result){
              socket.emit('newPortfolioData', result[0])
            })
          })
      })

      socket.on('inviteRequest', (data) => {
        let mail = data.mail
        let ip = data.ip

        if(mail.length > 0 && ip.length > 0){

          r.db('coinpair').table('requestInvite').filter(
            r.row("mail").eq(mail)
          ).
          run(connection, function(err, cursor) {
            if (err) throw err
            cursor.toArray((err, result) => {
              if (err) throw err

              if(result.length == 0){
                // GOOD

                r.db('coinpair').table('requestInvite').filter(
                  r.row("ip").eq(ip)
                ).
                run(connection, function(err, cursor) {
                  if (err) throw err
                  cursor.toArray((err, result) => {
                    if (err) throw err

                    if(result.length < 5){
                      // GOOD

                      r.db('coinpair').table('requestInvite').insert({
                        "ip": ip,
                        "mail": mail,
                        "timestamp": moment().unix()
                      }).run(connection, function(err, result) {
                        if (err) throw err

                        socket.emit('requestInviteCallback', {
                          success: true,
                          errorMsg: ''
                        })

                        log.white(pre(new Date) + "[INVITE] Invite requested by ["+mail+"]")

                      })

                    }else{

                      socket.emit('requestInviteCallback', {
                        success: false,
                        errorMsg: 'You already submitted 5 times.'
                      })

                    }

                  })
                })

              }
              else{

                socket.emit('requestInviteCallback', {
                  success: false,
                  errorMsg: 'E-Mail already in list.'
                })

              }
            })
          })

        }

      })

      socket.on('addWatchlistEvent', (data) => {
        let coinID = data.coinID
        let userID = data.userID

        // GET ALL PORTFOLIOS OF USER
        r.db('coinpair').table('users').filter(r.row('id').eq(data.userID))
        .run(connection, function(err, cursor) {
          cursor.toArray(function(err, result){

            let watchListOld = result[0].watchlist
            if(watchListOld.indexOf(coinID) === -1){
              watchListOld.push(coinID)

              r.db('coinpair').table('users').filter(r.row('id').eq(userID)).update({watchlist: watchListOld}).
              run(connection, function(err, result) {
                  if (err) throw err;
              })

            }
          })
        })

      })

      socket.on('deleteWatchlistEvent', (data) => {
        let coinID = data.coinID
        let userID = data.userID

        // GET ALL PORTFOLIOS OF USER
        r.db('coinpair').table('users').filter(r.row('id').eq(data.userID))
        .run(connection, function(err, cursor) {
          cursor.toArray(function(err, result){

            let watchListOld = result[0].watchlist
            let index = watchListOld.indexOf(coinID)

            if(index > -1){
              watchListOld.splice(index, 1)

              r.db('coinpair').table('users').filter(r.row('id').eq(userID)).update({watchlist: watchListOld}).
              run(connection, function(err, result) {
                  if (err) throw err;
              })

            }
          })
        })

      })

      socket.on('getUpdateDetails', (data) =>{
        /*
          Create Object:
            {
              bugs: ['..','..'],
              totalVotes,
              features: [{
              desc: '..',
              votes: 0
            }],
              totalVotes,
              votesLeft
            }
        */

        let userID = data.userID
        let leftVotes = leftVotesGlobal

        r.db('coinpair').table('featuresSoon')
        .run(connection, function(err, cursor) {
          cursor.toArray(function(err, result){

            let totalVotes = 0
            let object = {}

            let featuresArray = []
            let bugsArray = []

            for (let i = 0; i < result.length; i++){
              // go through all features
              let desc = result[i].desc
              let id = result[i].id
              let votes = 0


              for (let x = 0; x < result[i].votes.length; x++){
                if(result[i].votes[x].user === userID &&
                moment.unix(result[i].votes[x].timestamp).isSame(moment(), 'd')){
                  leftVotes--
                }
                // go through all Votes
                votes++
                totalVotes++
              }

              // Fill the featuresArray
              let featureObject = {desc, votes, id}
              featuresArray.push(featureObject)
            }

            r.db('coinpair').table('bugsPublic')
            .run(connection, function(err, cursor) {
              cursor.toArray(function(err, result){
                for(let i = 0; i < result.length; i++){
                  bugsArray.push(result[i].desc)
                }

                object = {
                  bugs: bugsArray,
                  features: featuresArray,
                  totalVotes,
                  leftVotes
                }

                socket.emit('updateDetailsCallback', object)

              })
            })

          })
        })

      })

      socket.on('voteEvent', (data) => {
        let userID = data.userID
        let featureID = data.featureID

        r.db('coinpair').table('featuresSoon').filter(r.row('id').eq(data.featureID))
        .run(connection, function(err, cursor) {
          cursor.toArray(function(err, result){
            let f = result[0]
            let oldVotes = f.votes

            let voteObject = {
              user: userID,
              timestamp: moment().unix()
            }

            oldVotes.push(voteObject)

            r.db('coinpair').table('featuresSoon').filter(r.row('id').eq(featureID)).update({votes: oldVotes}).
            run(connection, function(err, result) {
                if (err) throw err;
            })

          })
        })
      })

      socket.on('reportBugEvent', (data) => {
        let userBrowser = data.userAgent
        let userID      = data.userID
        let desc        = data.desc

        r.db('coinpair').table('bugs').insert({
          "userAgent": userBrowser,
          "userID": userID,
          "timestamp": moment().unix(),
          "desc": desc
        }).run(connection, function(err, result) {
          if (err) throw err
          socket.emit('reportBugCallback', {success: true})
        })

      })

      socket.on('requestFeatureEvent', (data) => {
        let userID      = data.userID
        let desc        = data.desc

        r.db('coinpair').table('requestedFeatures').insert({
          "userID": userID,
          "timestamp": moment().unix(),
          "desc": desc
        }).run(connection, function(err, result) {
          if (err) throw err
          socket.emit('requestFeatureCallback', {success: true})
        })

      })

      socket.on('buyPortfolioEvent', (data) => {
        let { coinID, price, amount, buyWith,
        desc, priceInTotal, date, userID, token, btcPriceUsd} = data

        if(priceInTotal){
          price = price / amount
        }

        r.db('coinpair').table('users').
        filter(
          function(doc) {
              return doc("token").contains(function(tokenInside) {
                  return tokenInside("token").eq(token)
              })
          }
        ).
        run(connection, function(err, cursor) {
            cursor.toArray(function (err, result){
              if(result.length > 0 && result.length < 2){
                // legit token
                // get portfolio details
                r.db('coinpair').table('portfolios').
                filter(r.row('fromUser').eq(userID)).
                run(connection, (err, cursor) => {
                  if (err) log.red(err)
                  cursor.toArray((err, result) => {
                    // portoflio got
                    let portfolio = result[0]
                    let oldPositions = portfolio.positions
                    let currencyUsdWorth = 1

                    if(buyWith === "BTC"){
                      currencyUsdWorth = btcPriceUsd
                    }

                    let newPosition = {
                      "addedTimestamp": moment().unix(),
                      "buyPrice": price,
                      "buyTime": moment(date).unix(),
                      "buyWith": buyWith,
                      "coinID": coinID,
                      "currencyUsdWorth": currencyUsdWorth,
                      "desc": desc,
                      "exchange": "",
                      "originalValue": Number(amount),
                      "positionID": makeid(15),
                      "sells": [
                      ]
                    }

                    oldPositions.push(newPosition)

                    r.db('coinpair').table('portfolios').
                    filter(r.row('fromUser').eq(userID)).update({positions: oldPositions}).
                    run(connection, function(err, result) {
                      if (err) reject(err)

                      socket.emit('buyPortfolioCallback', {success: true, userID})

                    })

                  })
                })

              /*  r.db('coinpair').table('portfolios').
                filter(r.row(row).eq(eq)).update(obj).
                run(this.db.connection, function(err, result) {
                  if (err) log(err)
                })*/


              }
              else{
                log.bright.red("Wrong token tried manipulating portfolio data.")
              }
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
