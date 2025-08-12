import { config } from "../config/config.js";
import { jwtUtil } from "./jwt.util.js";

async function verifyToken(tokens = undefined) {
  try {
    if (tokens != undefined && tokens != null) {
      //  console.log('\x1b[32m%s\x1b[0m',"data set ddddd")
      var Tok1, Tok2, Tok3;
      const splitResult = tokens.split(".");

      //   if invalid token provide
      if (splitResult.length != 3) {
        return {
          success: false,
          message: "invalid Token",
          token: tokens,
          user: null,
        };
      }

      Tok1 = splitResult[0];
      Tok2 = splitResult[1];
      Tok3 = splitResult[2];
      var t1 = Tok1.length;
      var t3 = Tok3.length;
      var t2 = Tok2.length;
      var mytoken =
        Tok1.slice(0, t1 - 20) +
        "." +
        Tok3.slice(20, t3) +
        "." +
        Tok2.slice(0, t2 - 20);
      //  console.log('\x1b[32m%s\x1b[0m',"Done Token : " + mytoken)

      //   to veryfy jwt token
      var verificationResult = await jwtUtil.verifyToken(
        mytoken,
        config.jwtKey
      );

      //   if any error while verifying token
      if (!verificationResult.success) {
        return {
          success: false,
          message: verificationResult.message,
        };
      }

      //   if token verified succesfully
      return { success: true, user: verificationResult.data };
    }

    //   if token not verified
    return {
      success: false,
      user: null,
    };
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", error);

    // if any error while verifing token
    return {
      success: false,
      user: null,
      message: error.message,
    };
  }
}

export { verifyToken };
