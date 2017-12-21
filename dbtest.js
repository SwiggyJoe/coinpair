"use strict";
const r         = require('rethinkdb')
let connection
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err
    connection = conn

    console.log("[SERVER] Database succesfully connected.")
    console.log("[SERVER] Start initalize the main Server..")


})                           /
