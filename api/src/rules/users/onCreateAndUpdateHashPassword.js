import { logger } from 'src/lib/logger'
import CryptoJS from 'crypto-js'
function randomString(len, charSet) {
  charSet =
    charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var randomString = ''
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length)
    randomString += charSet.substring(randomPoz, randomPoz + 1)
  }
  return randomString
}
module.exports = {
  active: true,
  order: 10,
  when: ['before'],
  operation: ['update', 'create'],
  table: 'user',
  file: __filename,
  command: async function ({ input, status }) {
    try {
      //if were given a password, we make a new salt, hash it and set both salt and hash
      let hashedPassword = input?.hashedPassword
      if (hashedPassword) {
        let salt = randomString(30)
        input.salt = salt.toString()
        let encryptedPassword = CryptoJS.PBKDF2(hashedPassword, salt, {
          keySize: 256 / 32,
        }).toString()
        input.hashedPassword = encryptedPassword
      } else {
        //hashpassword is empty.. lets not set this.
        delete input.hashedPassword
      }
    } catch (e) {
      logger.error(e)
    }
    return await { input, status }
  },
}
