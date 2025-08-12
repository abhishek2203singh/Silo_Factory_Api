const tokenFormater = {
  decode(newtoken) {
    // return new Promise(async (resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    var Tok1, Tok2, Tok3, Tok4;
    Tok1 = newtoken.split(".")[0];
    Tok2 = newtoken.split(".")[1];
    Tok3 = newtoken.split(".")[2];
    var code = this.getcode();
    var mytoken = Tok1 + code + "." + Tok3 + code + "." + code + Tok2;
    console.log("token length =>", mytoken.length);
    return mytoken;
    // });
  },

  //   to encode the token with random code  adding rondorm 20 characters
  getcode() {
    // return new Promise((resolve, reject) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 20; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
    // });
  },
};
export { tokenFormater };
