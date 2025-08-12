// const connt = require("../../connection");
// const emoji = require("node-emoji");
// //const em = require('../../../emojis.json');
// const smssend = require("../common/SMS");
// const emailsend = require("../common/Email");
// const codest = require("./codeset");
// const μ = require("microseconds");

// monring = [];
// evening = [];
// monring = [];
// evening = [];
// addmoring = 0;
// addevening = 0;

// class CommonController {
//   // for getting the state

//   country(io) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "select * from countries",
//           async (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             var rest = await this.insertreqest(0, "country", "GET");
//             if (rest != 0) {
//               return err ? reject(err) : resolve(result);
//             } else {
//               return resolve(err);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   statesby(Id, io) {
//     return new Promise((resolve, reject) => {
//       try {
//         if (Id > 0) {
//           const querydn = connt.query(
//             "select * from state where country_id =?",
//             [Id],
//             async (err, result) => {
//               //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//               console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//               var rest = await this.insertreqest(0, "states/:countryId", "GET");
//               if (rest != 0) {
//                 return err ? reject(err) : resolve(result);
//               } else {
//                 return resolve(err);
//               }
//             }
//           );
//         } else {
//           const querydn = connt.query(
//             "select * from state",
//             async (err, result) => {
//               //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//               console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//               var rest = await this.insertreqest(0, "states", "GET");
//               if (rest != 0) {
//                 return err ? reject(err) : resolve(result);
//               } else {
//                 return resolve(err);
//               }
//             }
//           );
//         }
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   Citys(id, io) {
//     return new Promise((resolve, reject) => {
//       try {
//         console.log("\x1b[32m%s\x1b[0m", id);
//         if (id > 0) {
//           const querydn = connt.query(
//             "select * from cities where state_id =?",
//             [id],
//             async (err, result) => {
//               //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//               console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//               var rest = await this.insertreqest(0, "/citys/:state_id", "GET");
//               if (rest != 0) {
//                 return err ? reject(err) : resolve(result);
//               } else {
//                 return resolve(err);
//               }
//             }
//           );
//         } else {
//           const querydn = connt.query(
//             "select * from cities",
//             async (err, result) => {
//               //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//               console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//               var rest = await this.insertreqest(0, "/citys", "GET");
//               if (rest != 0) {
//                 return err ? reject(err) : resolve(result);
//               } else {
//                 return resolve(err);
//               }
//             }
//           );
//         }
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   usersession(Id, loginBy, token, RoleId, firebasetoken, ioid) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydb = connt.query(
//           "Insert into users_login_activity(UserId, login_Drive_Type, token, RoleId, CreatedOn, CreatedBy) " +
//             "value(?, ?, ?, ?, current_timestamp(), ?)",
//           [Id, loginBy, token, RoleId, Id],
//           async (err, result) => {
//             console.log(
//               "\x1b[35m%s\x1b[0m",
//               "\n Socket Token : " + ioid + "\n"
//             );
//             //  console.log('\x1b[36m%s\x1b[0m',"\n" + querydb.sql);
//             const query2 = connt.query(
//               "update users set  SocketId = ?, Online_Offline = 1 where Id = ?",
//               [ioid, Id],
//               (err1, result1) => {
//                 //  console.log('\x1b[32m%s\x1b[0m',"\n" + query2.sql);
//                 return resolve(result1);
//               }
//             );
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(0);
//       }
//     });
//   }

//   userSessionLogin(
//     userId,
//     LoginDriveTypeId,
//     JwtToken,
//     firebasetoken,
//     ioid,
//     imei
//   ) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "Insert into User_Login_Session(UserId, JwtToken, LogTime, SocketToken, LoginDriveTypeId) " +
//             "value(?, ?, current_timestamp(), ?, ?)",
//           [userId, JwtToken, ioid, LoginDriveTypeId],
//           async (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             // var rest = await base.insertreqest(Id, 'Login', 'POST');
//             // if (rest != 0) {
//             if (imei != "NA") {
//               await this.UserDevice(
//                 userId,
//                 LoginDriveTypeId,
//                 firebasetoken,
//                 imei
//               );
//             }
//             if (firebasetoken != "NA") {
//               const query2 = connt.query(
//                 "update users set FirebaseToken = ?, SocketId = ?, onlineStatus = 1 where Id = ?",
//                 [firebasetoken, ioid, userId],
//                 (err1, result1) => {
//                   console.log("\x1b[32m%s\x1b[0m", "\n" + query2.sql);
//                   return resolve(result1);
//                 }
//               );
//             } else {
//               return resolve(result);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(0);
//       }
//     });
//   }

//   UserDevice(UserId, DeviceTypeId, DeviceTokenFb, imei) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "insert into user_device(user_id, Device_TypeId, device_token, imei) value(?, ?, ?, ?)",
//           [UserId, DeviceTypeId, DeviceTokenFb, imei],
//           async (err, result) => {
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             return resolve(result);
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   getotp() {
//     return new Promise((resolve, reject) => {
//       try {
//         var result = "";
//         // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//         var characters = "0123456789";
//         var charactersLength = characters.length;
//         for (var i = 0; i < 6; i++) {
//           result += characters.charAt(
//             Math.floor(Math.random() * charactersLength)
//           );
//         }
//         return resolve(result);
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(0);
//       }
//     });
//   }

//   sendotp(Id, mobile, email) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         var Otp = await this.getotp();
//         if (Otp.length != 6) {
//           Otp = "RitZ01";
//         }
//         const query2 = connt.query(
//           "Select * from verification_otp where UserId = ? and Status = 1",
//           [Id],
//           (err1, result1) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + query2.sql);
//             if (result1.length > 0) {
//               var otpdatetime = result1[0].CreatedOn;
//               console.log("\x1b[32m%s\x1b[0m", "\n" + otpdatetime);
//               var settime = new Date(otpdatetime.getTime() + 10 * 60000);
//               console.log("\x1b[32m%s\x1b[0m", "\n" + settime);
//               var currentDate = new Date();
//               console.log("\x1b[32m%s\x1b[0m", "\n" + currentDate);
//               if (settime >= currentDate) {
//                 console.log("\x1b[32m%s\x1b[0m", "User Old OTP send");
//                 return resolve(result1[0].Verification_OTP);
//               } else {
//                 const query2 = connt.query(
//                   "update verification_otp set Status = 0 where UserId = ?",
//                   [Id],
//                   (err2, result2) => {
//                     //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//                     console.log("\x1b[32m%s\x1b[0m", "\n" + query2.sql);
//                     if ((result2.protocol41 = true)) {
//                       const querydn = connt.query(
//                         "insert into verification_otp(UserId, Verification_OTP, Otp_type_Id, Status, CreatedOn, CreatedBy) " +
//                           "value(?,?,1,1,current_timestamp(),?)",
//                         [Id, Otp, Id],
//                         (err, result) => {
//                           //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//                           console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//                           if (result.insertId > 0) {
//                             const query4 = connt.query(
//                               "insert into all_request(user_requestId, UserId, CreatedON, CreatedBy, API_Name, API_Type) " +
//                                 " values(2, ?, current_timestamp(), ?, '/forgetpassword/:username', 'GET')",
//                               [Id, Id],
//                               async (err3, result3) => {
//                                 //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//                                 console.log(
//                                   "\x1b[32m%s\x1b[0m",
//                                   "\n" + query4.sql
//                                 );
//                                 if (result3.insertId > 0) {
//                                   var sendOtp = await this.SendotpfromUser(
//                                     Otp,
//                                     mobile,
//                                     email
//                                   );
//                                   if (sendOtp == true) {
//                                     return err3
//                                       ? reject(err3)
//                                       : resolve({ Status: sendOtp, OTP: Otp });
//                                   } else {
//                                     return err3
//                                       ? reject(err3)
//                                       : resolve("error");
//                                   }
//                                 } else {
//                                   return err3 ? reject(err3) : resolve("error");
//                                 }
//                               }
//                             );
//                           }
//                         }
//                       );
//                     }
//                   }
//                 );
//               }
//             } else {
//               const querydn = connt.query(
//                 "insert into verification_otp(UserId, Verification_OTP, Otp_type_Id, Status, CreatedOn, CreatedBy) " +
//                   "value(?,?,1,1,current_timestamp(),?)",
//                 [Id, Otp, Id],
//                 (err, result) => {
//                   //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//                   console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//                   if (result.insertId > 0) {
//                     const query4 = connt.query(
//                       "insert into all_request(user_requestId, UserId, CreatedON, CreatedBy, API_Name, API_Type) " +
//                         " values(2, ?, current_timestamp(), ?, '/forgetpassword/:username', 'GET')",
//                       [Id, Id],
//                       async (err3, result3) => {
//                         //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//                         console.log("\x1b[32m%s\x1b[0m", "\n" + query4.sql);
//                         if (result3.insertId > 0) {
//                           var sendOtp = await this.SendotpfromUser(
//                             Otp,
//                             mobile,
//                             email
//                           );
//                           if (sendOtp == true) {
//                             return err3
//                               ? reject(err3)
//                               : resolve({ Status: sendOtp, OTP: Otp });
//                             s;
//                           } else {
//                             return err3 ? reject(err3) : resolve("error");
//                           }
//                         } else {
//                           return err3 ? reject(err3) : resolve("error");
//                         }
//                       }
//                     );
//                   }
//                 }
//               );
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve("error");
//       }
//     });
//   }

//   SendotpfromUser(Otp, mobile, email) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         console.log("\x1b[32m%s\x1b[0m", Otp, mobile, email);
//         if (mobile.length == 13) {
//           console.log("\x1b[32m%s\x1b[0m", " \n * \n  Mobile data ==========");
//           var dataMobile = await smssend.OTPSMS({
//             sms: Otp,
//             mobileno: mobile,
//             text: "OTP : ",
//           });
//           console.log(
//             "\x1b[32m%s\x1b[0m",
//             "OTP SSSSend     " + dataMobile.Status
//           );
//           return resolve(dataMobile.Status);
//         } else {
//           console.log("\x1b[32m%s\x1b[0m", "\n * \n Email =============");
//           var sendemail = await emailsend.emailsend({
//             email: [{ useremail: email }],
//             msg: "OTP : " + Otp,
//           });
//           return resolve(sendemail.Status);
//         }
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   testing(io) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "select Id, DATE_ADD(`dob`, INTERVAL 1 DAY) as newdate from testing",
//           async (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             console.log("\x1b[32m%s\x1b[0m", result[2]);
//             return err ? reject(err) : resolve(result);
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return reject(err);
//       }
//     });
//   }

//   // =============================================== EMOJI ==================================================

//   getemoji(io) {
//     return new Promise((resolve, reject) => {
//       try {
//         var emojidata = [];
//         const querydn = connt.query(
//           "select * from master_emoji",
//           async (err, result) => {
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             for (var r = 0; result.length > r; r++) {
//               var data = result[r].Name;
//               const emo = emoji.get(data);
//               emojidata.push({
//                 Id: result[r].Id,
//                 unicodeName: data,
//                 character: emo,
//               });
//             }
//             return resolve(emojidata);
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   emojilop(io) {
//     return new Promise((resolve, reject) => {
//       try {
//         var emojidat = [];
//         const querydn = connt.query(
//           "select * from EMOJI_test",
//           async (err, result) => {
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             for (var r = 0; result.length > r; r++) {
//               if (
//                 result[r].shortname != undefined &&
//                 result[r].shortname != ""
//               ) {
//                 var data = result[r].shortname.split(":")[1];
//                 console.log("\x1b[32m%s\x1b[0m", data);
//                 const emo = emoji.get(data);
//                 emojidat.push({
//                   Id: result[r].Id,
//                   unicodeName: data,
//                   character: emo,
//                 });
//               }
//             }
//             return resolve(emojidat);
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   getemojibyId(Id, io) {
//     return new Promise((resolve, reject) => {
//       try {
//         var emojidata = [];
//         const querydn = connt.query(
//           "select * from master_emoji where Id= ?",
//           [Id],
//           async (err, result) => {
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             for (var r = 0; result.length > r; r++) {
//               var data = result[r].Name;
//               const emo = emoji.get(data);
//               emojidata.push({
//                 Id: result[r].Id,
//                 unicodeName: data,
//                 character: emo,
//               });
//             }
//             return resolve(emojidata);
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   searchall(Id, io, start, word) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const query4 = connt.query(
//           "insert into all_request(user_requestId, UserId, CreatedON, CreatedBy, API_Name, API_Type) " +
//             " values(2, ?, current_timestamp(), ?, '/searchall', 'GET')",
//           [Id, Id],
//           async (err3, result3) => {
//             const query4 = connt.query(
//               "select * from users where Id = ?",
//               [Id],
//               async (err, result) => {
//                 if (result.length > 0) {
//                   var newlike = "%" + word + "%";
//                   var user = await this.searchUser(newlike);
//                   var post = await this.searchpost(newlike);
//                   var video = await this.searchvideo(newlike);
//                   var searchdta = {
//                     User: user,
//                     Post: post,
//                     Video: video,
//                   };
//                   var end = μ.parse(Date.now()).toString();
//                   io.emit("searchall", {
//                     ApiStart: start,
//                     ApiEnd: end,
//                     status: true,
//                     message: "Data Found",
//                     code: 200,
//                     result: searchdta,
//                   });
//                 } else {
//                   var end = μ.parse(Date.now()).toString();
//                   io.emit("searchall", {
//                     ApiStart: start,
//                     ApiEnd: end,
//                     status: false,
//                     message: "Login Please Authorization failed",
//                     code: 400,
//                     result: {},
//                   });
//                 }
//               }
//             );
//           }
//         );
//       } catch (e) {
//         var end = μ.parse(Date.now()).toString();
//         io.emit("searchall", {
//           ApiStart: start,
//           ApiEnd: end,
//           status: false,
//           message: e,
//           code: 400,
//           result: {},
//         });
//       }
//     });
//   }

//   bg(Id, io, start) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "select * from Master_BackgroundImg",
//           async (err, result) => {
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             if (result.length > 0) {
//               const query1 = connt.query(
//                 "insert into all_request(user_requestId, UserId, CreatedON, CreatedBy, API_Name, API_Type) " +
//                   " values(2, ?, current_timestamp(), ?,'/bg', 'GET')",
//                 [Id, Id],
//                 async (err1, result1) => {
//                   //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//                   console.log("\x1b[32m%s\x1b[0m", "\n" + query1.sql);
//                   var end = μ.parse(Date.now()).toString();
//                   io.emit("bg", {
//                     ApiStart: start,
//                     ApiEnd: end,
//                     status: true,
//                     message: "Data Found",
//                     code: 200,
//                     result: result,
//                   });
//                   return resolve(result);
//                 }
//               );
//             } else {
//               var end = μ.parse(Date.now()).toString();
//               io.emit("bg", {
//                 ApiStart: start,
//                 ApiEnd: end,
//                 status: false,
//                 message: "Data not Found",
//                 code: 204,
//                 result: [],
//               });
//               return resolve(0);
//             }
//           }
//         );
//       } catch (e) {
//         var end = μ.parse(Date.now()).toString();
//         io.emit("bg", {
//           ApiStart: start,
//           ApiEnd: end,
//           status: false,
//           message: e,
//           code: 204,
//           result: [],
//         });
//         return resolve(0);
//       }
//     });
//   }

//   testemoji(data, io) {
//     return new Promise((resolve, reject) => {
//       try {
//         const emo = emoji.get(data);
//         return resolve(emo);
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve(err);
//       }
//     });
//   }

//   // insertemoji(io) {
//   // return new Promise((resolve, reject) => {
//   // for (var zz = 0; em.emojis.length > zz; zz++) {
//   //     const querydn = connt.query('insert into EMOJI(name, shortname, unicode, html, category, orderset, Status, CreatedBy, CreatedOn) ' +
//   //         'value(?, ?, ?, ?, ?, ?, 1, 1, current_timestamp())',
//   //         [em.emojis[zz].name, em.emojis[zz].shortname, em.emojis[zz].unicode, em.emojis[zz].html, em.emojis[zz].category, em.emojis[zz].order], async (err, result) => {
//   //              console.log('\x1b[32m%s\x1b[0m',"\n" + querydn.sql);
//   //              console.log('\x1b[32m%s\x1b[0m',result)
//   //         })
//   // }
//   // })
//   // }

//   // =============================================== EMOJI ==================================================

//   getallimg(Id) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "select * from post_image where CreatedBy = ? order by CreatedOn DESC",
//           [Id],
//           (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             if (result.length > 0) {
//               return resolve(result);
//             } else {
//               return resolve([]);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve([]);
//       }
//     });
//   }

//   getallvid(Id) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "select * from post_video where CreatedBy = ? order by CreatedOn DESC",
//           [Id],
//           (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             if (result.length > 0) {
//               return resolve(result);
//             } else {
//               return resolve([]);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve([]);
//       }
//     });
//   }

//   getallado(Id) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "select * from post_audio where CreatedBy = ? order by CreatedOn DESC",
//           [Id],
//           (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             if (result.length > 0) {
//               return resolve(result);
//             } else {
//               return resolve([]);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve([]);
//       }
//     });
//   }
//   getallfile(Id) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "select * from post_file where CreatedBy = ? order by CreatedOn DESC",
//           [Id],
//           (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             if (result.length > 0) {
//               return resolve(result);
//             } else {
//               return resolve([]);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve([]);
//       }
//     });
//   }

//   getallworking(Id) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "SELECT uwr.Id as Id, uwr.LogoImg as LogoImg, uwr.CompanyName as CompanyName, uwr.Job_Title as Job_Title, uwr.Addreass as Addreass, uwr.StateId as StateId, uwr.CityId as CityId, " +
//             "uwr.CountryId as CountryId, uwr.Description as Description, uwr.From_date as From_date, uwr.To_date as To_date, uwr.Currently_Working as Currently_Working, uwr.Seane_Post_Type as Seane_Post_Type, " +
//             "cst.countryName as countryname, st.name as statename, ct.name as cityname FROM user_working as uwr " +
//             "left join countries as cst on uwr.CountryId = cst.countryID left join state as st on uwr.StateId = st.id " +
//             "left join cities as ct on uwr.CityId = ct.id where uwr.CreatedBy = ?;",
//           [Id],
//           (err, result) => {
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             if (result.length > 0) {
//               return resolve(result);
//             } else {
//               return resolve([]);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve([]);
//       }
//     });
//   }

//   getalleducation(Id) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "SELECT * FROM user_Education where CreatedBy = ?;",
//           [Id],
//           (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             if (result.length > 0) {
//               return resolve(result);
//             } else {
//               return resolve([]);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve([]);
//       }
//     });
//   }

//   getfriendlist(Id) {
//     return new Promise((resolve, reject) => {
//       try {
//         const querydn = connt.query(
//           "SELECT * FROM user_friendsdetail where sfr_UserId = ? and sfr_AcceptStatus = 2;",
//           [Id],
//           (err, result) => {
//             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
//             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
//             if (result.length > 0) {
//               return resolve(result);
//             } else {
//               return resolve([]);
//             }
//           }
//         );
//       } catch (e) {
//         console.log("\x1b[32m%s\x1b[0m", e);
//         return resolve([]);
//       }
//     });
//   }

// //   commenttree(postId, io) {
// //     console.log(
// //       "\x1b[32m%s\x1b[0m",
// //       "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! : " + postId + "\n"
// //     );
// //     return new Promise(async (resolve, reject) => {
// //       try {
// //         var commentreparray = [],
// //           tree;
// //         const querydn = connt.query(
// //           "SELECT t1.Id, t1.CommentText, t1.CommentTypeId, t1.childId as t1childId, t1.PostId, t1.CommentTo, t1.Status, t1.CreatedBy," +
// //             " t1.CreatedOn, t1.ViewBy, t2.Id as childId, ur.Id as urId,  ur.Fname as username, ur.Lname as userLname, ur.ImagesUrl as profileimg FROM Post_comments AS t1 " +
// //             " LEFT JOIN Post_comments AS t2 ON t2.childId = t1.Id " +
// //             "left join users as ur on t1.CreatedBy = ur.Id WHERE t1.PostId = ? order by t1.CreatedOn DESC",
// //           [postId],
// //           async (err, result) => {
// //             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
// //             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
// //             if (result.length > 0) {
// //               for (var pt = 0; result.length > pt; pt++) {
// //                 if (result[pt].t1childId != null) {
// //                   var commentdata = await this.setcommentsdata(result[pt].Id);
// //                 }
// //                 if (result[pt].t1childId != null) {
// //                   console.log(
// //                     "\x1b[32m%s\x1b[0m",
// //                     "commendts List data : " + commentdata.Id + "\n"
// //                   );
// //                   commentreparray.push(commentdata);
// //                 }
// //               }

// //               function unflatten(arr) {
// //                 var tree = [],
// //                   mappedArr = {},
// //                   arrElem,
// //                   mappedElem;
// //                 for (var i = 0, len = arr.length; i < len; i++) {
// //                   arrElem = arr[i];
// //                   mappedArr[arrElem.Id] = arrElem;
// //                   mappedArr[arrElem.Id]["children"] = [];
// //                 }
// //                 for (var Id in mappedArr) {
// //                   if (mappedArr.hasOwnProperty(Id)) {
// //                     mappedElem = mappedArr[Id];
// //                     if (mappedElem.parentId) {
// //                       mappedArr[mappedElem["parentId"]]["children"].push(
// //                         mappedElem
// //                       );
// //                     } else {
// //                       tree.push(mappedElem);
// //                     }
// //                   }
// //                 }
// //                 return tree;
// //               }

// //               var tree = unflatten(commentreparray);
// //               console.log("\x1b[32m%s\x1b[0m", tree);
// //               return resolve(tree);
// //             } else {
// //               return resolve("0");
// //             }
// //           }
// //         );
// //       } catch (e) {
// //         return resolve("0");
// //       }
// //     });
// //   }

//   // list_to_tree(list) {
//   //     var map = {}, roots = [], i, j;
//   //     for (i = 0; list.length > i; i++) {
//   //          console.log('\x1b[32m%s\x1b[0m',"\n" + i)
//   //         map[list[i].ptcmt_Id] = i; // initialize the map
//   //         list[i].children = []; // initialize the children
//   //     }

//   //     for (j = 0; list.length > j; j++) {
//   //         if (list[j].ptcmt_childId !== "0") {
//   //             // if you have dangling branches check that map[node.parentId] exists

//   //              console.log('\x1b[32m%s\x1b[0m',"datalist : " + list[j])
//   //             list[j].children.push(list[j]);
//   //         } else {
//   //             roots.push(list[j]);
//   //         }
//   //     }
//   //     return roots;
//   // }

// //   setcommentsdata(Id) {
// //     return new Promise(async (resolve, reject) => {
// //       try {
// //         var comment;
// //         console.log(
// //           "\x1b[32m%s\x1b[0m",
// //           "\n================ Comment ID Pankaj ===" +
// //             Id +
// //             "====================================================================================================\n"
// //         );
// //         if (Id == null) {
// //           return resolve("");
// //         } else {
// //           //  console.log('\x1b[32m%s\x1b[0m',"\n================ Comment ID ===" + Id + "====================================================================================================\n");
// //           const querydn = connt.query(
// //             "select * from comments where Id = ?",
// //             [Id],
// //             async (err, result) => {
// //               console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
// //               const query1 = connt.query(
// //                 "select * from post_comment_emoji where PostCommentId = ?",
// //                 [Id],
// //                 async (err1, result1) => {
// //                   console.log("\x1b[32m%s\x1b[0m", "\n" + query1.sql);
// //                   const query2 = connt.query(
// //                     "select * from post_comment_gif where PostCommentId = ?",
// //                     [Id],
// //                     async (err2, result2) => {
// //                       console.log("\x1b[32m%s\x1b[0m", "\n" + query2.sql);
// //                       const query3 = connt.query(
// //                         "select * from post_comment_ImgVideo where PostCommentId = ?",
// //                         [Id],
// //                         async (err3, result3) => {
// //                           console.log("\x1b[32m%s\x1b[0m", "\n" + query3.sql);
// //                           const query4 = connt.query(
// //                             "select * from post_comment_Sticker where PostCommentId = ?",
// //                             [Id],
// //                             async (err4, result4) => {
// //                               console.log(
// //                                 "\x1b[32m%s\x1b[0m",
// //                                 "\n" + query4.sql
// //                               );
// //                               const query5 = connt.query(
// //                                 "SELECT mstemji.Id as mstemji_Id, mstemji.Name as mstemji_Name, mstemji.group as mstemji_group," +
// //                                   "mstemji.subGroup as mstemji_subGroup, pstcmtlike.Id as pstcmtlike_Id, pstcmtlike.emojiId as pstcmtlike_emojiId, pstcmtlike.Status as pstcmtlike_Status," +
// //                                   "pstcmtlike.CreatedBy as pstcmtlike_CreatedBy, pstcmtlike.CreatedOn as pstcmtlike_CreatedOn, pstcmtlike.ViewBy as pstcmtlike_ViewBy, " +
// //                                   "pstcmtlike.CommentTo as pstcmtlike_CommentTo, ur.Id as uId, ur.Fname as UserFistname, ur.Lname as UserLastname, ur.ImagesUrl as Userimage, ur.BlueMark as u_BlueMark  " +
// //                                   "FROM post_comment_Like as pstcmtlike left join master_emoji as mstemji on pstcmtlike.emojiId = mstemji.Id " +
// //                                   "left join users as ur on pstcmtlike.Createdby = ur.Id where pstcmtlike.commentId  = ?",
// //                                 [Id],
// //                                 async (err5, result5) => {
// //                                   console.log(
// //                                     "\x1b[32m%s\x1b[0m",
// //                                     "\n" + query5.sql
// //                                   );

// //                                   comment = await {
// //                                     Id: result[0].Id,
// //                                     ptcmt_CommentText:
// //                                       result[0].ptcmt_CommentText,
// //                                     ptcmt_CommentTypeId:
// //                                       result[0].ptcmt_CommentTypeId,
// //                                     ptcmt_CreatedOn: result[0].ptcmt_CreatedOn,
// //                                     mstcmt_Name: result[0].mstcmt_Name,
// //                                     parentId: result[0].parentid,
// //                                     ptcmt_PostId: result[0].ptcmt_PostId,
// //                                     ptcmt_Status: result[0].ptcmt_Status,
// //                                     ptcmt_ViewBy: result[0].ptcmt_ViewBy,
// //                                     ur_Id: result[0].ur_Id,
// //                                     ur_UserId: result[0].ur_UserId,
// //                                     ur_Fname: result[0].ur_Fname,
// //                                     ur_Lname: result[0].ur_Lname,
// //                                     ur_MobileNo: result[0].ur_MobileNo,
// //                                     ur_Email: result[0].ur_Email,
// //                                     ur_SocketId: result[0].ur_SocketId,
// //                                     ur_FirebaseToken:
// //                                       result[0].ur_FirebaseToken,
// //                                     ur_ImagesUrl: result[0].ur_ImagesUrl,
// //                                     BlueMark: result[0].u_BlueMark,
// //                                     comments_like: result5,
// //                                     comments_Sticker: result4,
// //                                     comments_ImgVide: result3,
// //                                     comments_Gif: result2,
// //                                     comments_emoji: result1,
// //                                   };
// //                                   console.log(
// //                                     "\x1b[32m%s\x1b[0m",
// //                                     "\n Comments data Id  : " +
// //                                       comment.Id +
// //                                       "\n"
// //                                   );
// //                                   return resolve(comment);
// //                                 }
// //                               );
// //                             }
// //                           );
// //                         }
// //                       );
// //                     }
// //                   );
// //                 }
// //               );
// //             }
// //           );
// //         }
// //       } catch (e) {
// //         return resolve(err);
// //       }
// //     });
// //   }

// //   insertreqest(Id, APIName, ApiType) {
// //     return new Promise(async (resolve, reject) => {
// //       try {
// //         const querydn = connt.query(
// //           "insert into all_request(user_requestId, UserId, CreatedON, CreatedBy, API_Name, API_Type) " +
// //             " values(2, ?, current_timestamp(), ?, ?, ?)",
// //           [Id, Id, APIName, ApiType],
// //           async (err, result) => {
// //             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
// //             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
// //             if (result.insertId > 0) {
// //               return err ? reject(err) : resolve(result.insertId);
// //             } else {
// //               return err ? reject(err) : resolve(0);
// //             }
// //           }
// //         );
// //       } catch (e) {
// //         console.log("\x1b[32m%s\x1b[0m", e);
// //         return err ? reject(err) : resolve(0);
// //       }
// //     });
// //   }

// //   searchUser(data) {
// //     return new Promise(async (resolve, reject) => {
// //       try {
// //         const querydn = connt.query(
// //           "select * from users where Fname like ? or Lname like ?",
// //           [data, data],
// //           (err1, result1) => {
// //             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
// //             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
// //             return resolve(result1);
// //           }
// //         );
// //       } catch (e) {
// //         return resolve(e);
// //       }
// //     });
// //   }

// //   searchpost(data) {
// //     return new Promise(async (resolve, reject) => {
// //       try {
// //         const querydn = connt.query(
// //           "select * from user_post where Text like ?",
// //           [data],
// //           (err1, result1) => {
// //             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
// //             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
// //             return resolve(result1);
// //           }
// //         );
// //       } catch (e) {
// //         return resolve(e);
// //       }
// //     });
// //   }

// //   searchvideo(data) {
// //     return new Promise(async (resolve, reject) => {
// //       try {
// //         const querydn = connt.query(
// //           "select * from post_video where Title like ? or Description like ?",
// //           [data, data],
// //           (err1, result1) => {
// //             //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
// //             console.log("\x1b[32m%s\x1b[0m", "\n" + querydn.sql);
// //             return resolve(result1);
// //           }
// //         );
// //       } catch (e) {
// //         return resolve(e);
// //       }
// //     });
// //   }
// }
// export default new CommonController();
