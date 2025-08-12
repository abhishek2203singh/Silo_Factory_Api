
const connt = require('../../connection');
const smssend = require('../common/SMS');
const emailsend = require('../common/Email');
const setcode = require('./common/codeset')
const sct = require('../Social/SocialController')
class Comments {
   

    // encrypt(value) {
    //     let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    //     let encrypted = cipher.update(value);
    //     encrypted = Buffer.concat([encrypted, cipher.final()]);
    //     return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    // }

    // decrypt(text) {
    //     let iv = Buffer.from(text.iv, 'hex');
    //     let encryptedText = Buffer.from(text.encryptedData, 'hex');
    //     let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    //     let decrypted = decipher.update(encryptedText);
    //     decrypted = Buffer.concat([decrypted, decipher.final()]);
    //     return decrypted.toString();
    // }

    getotp() {
        return new Promise((resolve, reject) => {
            var result = '';
            // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var characters = '0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return resolve(result);
        });
    }


    getotpnumber() {
        return new Promise((resolve, reject) => {
            var result = '';
            // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var characters = '0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return resolve(result);
        });
    }




}
module.exports = new Comments();