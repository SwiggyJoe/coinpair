
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

  // ____________________________________________ \\
  // Declare all Variables
  // ____________________________________________ \\

  function pre (datum) { return "[" + moment(datum).format('D-M-Y HH:mm:ss') + "]"}

  // SocketIO
  const port = 8000

  // Object with all information about coins
  // !!!!!!!!!!! DO NOT SEND THIS TO CLIENT !!!!!!!!!!!!!!!!
  let allCoinObject = []

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

    /*r.db('coinpair').table('users').insert(user).
    run(connection, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });*/

    // Starting SocketIO connection
    io.listen(port)
    log.bright.magenta(pre(new Date)+'[IO] Listening on port ', port)

    io.on('connection', (socket) => {

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
                      socket.emit('loginCallback', {
                        success: true,
                        token: token
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

    })


  }

  var stdin = process.openStdin();
  stdin.addListener("data", function(d) {

    var string = d.toString().trim().split(" ");

    if(string[0] === "login"){

      let username = string[1]
      let password = createPasswordHash(string[2])

      log("username: "+ username)
      log("password hash: "+ password)

      r.db('coinpair').table('users').filter(r.row('username').eq(username)).
      run(connection, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result) {
              if (err) throw err;

              if(result[0].password == password){
                console.log("logged in")
              }
              else{
                console.log("wrong password.. try again")
              }

              //console.log(JSON.stringify(result, null, 2));
          });
      });

    }

    if(string[0] === "x"){
      checkIfUserExist(string[1])
    }
  })
