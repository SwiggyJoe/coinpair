
  const crypto    = require('crypto')

  export function createPasswordHash(passwordToEncrypt){
    var algorithm = 'aes256'
    var key = 'TKdj312kRIGTfXEhK2LDiiKGcxBlMy32N4x1WE8Bkjpw8ffqDjSqrUiFVvYv'
    var text = passwordToEncrypt

    var cipher = crypto.createCipher(algorithm, key)
    var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')

    return encrypted;
  }
