
const connt = require('../../connection');
const commect = require('./commoncontroller');
const basefile = require('./BaseFile');
const emoji = require('node-emoji');
var path = require("path");
var fs = require('fs');
const { isObject } = require('util');
const μ = require('microseconds');
var post_p, post_s;


// const AWS = require('aws-sdk');
// AWS.config.update({
//     "accessKeyId": 'AKIA4KE3QFVYQVFIGAJ7',
//     "secretAccessKey": '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',
//     "region": 'ap-south-1',
// });




class CodeSet {
    emaildata(msg, email) {
        var mailOptions = {
            from: "noreply@gpslab.in",
            to: email,
            subject: "RitzVR noreply massage",
            html: "OTP : " + msg
        };
        return mailOptions;
    }


    // post_image post_audio post_feeling_activity post_file post_map post_tag  post_video Post_type
    getpostbyuser(postId) {
        return new Promise(async (resolve, reject) => {

            // console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n\n\n\n\n\n\n\n   " + postId);
            // console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n\n\n\n\n\n\ ================================= \n" + postId + "\n  ===================================================\n\n\n\n\n\n\n\n")
            var empji = [];
            var emo;
            const query7 = connt.query('select * from User_Post_post where upt_Id = ? and u_Status = 1',
                [postId], (err7, result7) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query7.sql);
                    if (result7.length > 0) {
                        const query8 = connt.query('select upt.Id as Id, upt.Text as Text, upt.UserId as UserId, upt.Status as Status, ' +
                            'upt.PostType as PostTypeId, pty.Name as PostType,upt.CreatedBy as  CreatedBy, upt.CreatedOn as CreatedOn ' +
                            'from user_post as upt left join Master_Post_type as pty on upt.PostType = pty.Id where upt.Id = ? and upt.Status = 1 ORDER BY upt.CreatedOn DESC',
                            [postId], (err8, result8) => {
                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                console.log('\x1b[32m%s\x1b[0m', "\n" + query8.sql);
                                if (result8.length > 0) {
                                    const querydn = connt.query('select * from post_image where postId = ? and Status = 1 and ViewBy = 1',
                                        [postId], (err, result) => {
                                            //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                            console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                                            const query1 = connt.query('select * from post_audio where postId = ? and Status = 1  and ViewBy = 1',
                                                [postId], (err1, result1) => {
                                                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                    console.log('\x1b[33m%s\x1b[0m', "\n" + query1.sql);
                                                    const query2 = connt.query('SELECT ptfa.Id as Id, ptfa.emojiId as emojiId, ptfa.title as title, memoji.Name as Name FROM post_feeling_activity as ptfa left join master_emoji as memoji on ptfa.emojiId = memoji.Id ' +
                                                        ' where ptfa.postId = ? and ptfa.Status = 1  and ptfa.ViewBy = 1',
                                                        [postId], (err2, result2) => {
                                                            console.log('\x1b[32m%s\x1b[0m', "\n" + query2.sql);
                                                            if (result2.length > 0) {
                                                                for (var r = 0; result2.length > r; r++) {
                                                                    var emdata = result2[r].Name;
                                                                    emo = emoji.get(emdata);
                                                                    var setdata = {
                                                                        Id: result2[r].Id,
                                                                        emojiId: result2[r].emojiId,
                                                                        title: result2[r].title,
                                                                        EmojiICON: emo
                                                                    }
                                                                    empji.push(setdata);
                                                                }
                                                            } else {
                                                                empji.push({});
                                                            }

                                                            const query3 = connt.query('select * from post_file where postId = ? and Status = 1  and ViewBy = 1',
                                                                [postId], (err3, result3) => {
                                                                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                    console.log('\x1b[32m%s\x1b[0m', "\n" + query3.sql);

                                                                    const query4 = connt.query('select * from post_map where postId = ? and Status = 1  and ViewBy = 1',
                                                                        [postId], (err4, result4) => {
                                                                            //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                            console.log('\x1b[32m%s\x1b[0m', "\n" + query4.sql);
                                                                            const query5 = connt.query('select pt.Id as TagId, pt.TagText, pt.CreatedOn, u.Id as uId, u.UserId as userId, u.Fname as Fistname,' +
                                                                                'u.Lname as lastname, u.MobileNo as mobileno, u.Email as email, ct.name as cityname, st.name as statename,' +
                                                                                'cus.countryName as countryName, u.Zipcode, u.ImagesUrl from post_tag as pt left join users as u  on pt.FriendId = u.Id ' +
                                                                                'left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cus on u.CountryId = cus.countryID ' +
                                                                                'where pt.PostId = ? and pt.Status = 1  and pt.ViewBy = 1', //joining
                                                                                [postId], (err5, result5) => {
                                                                                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                                    console.log('\x1b[32m%s\x1b[0m', "\n" + query5.sql);
                                                                                    const query6 = connt.query('select * from post_video where postId = ? and Status = 1  and ViewBy = 1',
                                                                                        [postId], (err6, result6) => {
                                                                                            //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                                            console.log('\x1b[32m%s\x1b[0m', "\n" + query6.sql);
                                                                                            const query9 = connt.query('select ptbg.Id as Id,ptbg.BackgroundColor as bgcolor,ptbg.Css_tg as csstg,ptbg.bgimageId as bgimgId,' +
                                                                                                'ptbg.Status as status,ptbg.ViewBy as viewby,mstbgimg.Url as bgimg from Post_background as ptbg left join Master_BackgroundImg as ' +
                                                                                                'mstbgimg on ptbg.bgimageId = mstbgimg.Id where ptbg.postId = ? and ptbg.Status = 1 and ptbg.ViewBy = 1',
                                                                                                [postId], (err9, result9) => {
                                                                                                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                                                    console.log('\x1b[32m%s\x1b[0m', "\n" + query9.sql);
                                                                                                    const query10 = connt.query('select * from Postlike where Plk_PostId = ?  and Plk_ViewBy = 1 and Plk_Status = 1',
                                                                                                        [postId], async (err10, result10) => {
                                                                                                            console.log('\x1b[32m%s\x1b[0m', "\n" + query10.sql);
                                                                                                            // const query11 = connt.query('select * from comments where parentId = 0 and ptcmt_PostId = ? and ptcmt_ViewBy = 1 order by ptcmt_CreatedOn DESC',
                                                                                                            // [postId], async (err11, result11) => {
                                                                                                            //      console.log('\x1b[32m%s\x1b[0m',"\n" + query11.sql);

                                                                                                            var newcomments = await commect.commenttree(postId);

                                                                                                            if (newcomments == 0) {
                                                                                                                newcomments = [];
                                                                                                            }
                                                                                                            var dataset = {
                                                                                                                "USERDATA": {
                                                                                                                    "Id": result7[0].uId,
                                                                                                                    "UserId": result7[0].u_UserId,
                                                                                                                    "Fistname": result7[0].u_Fname,
                                                                                                                    "Lastname": result7[0].u_Lname,
                                                                                                                    "Gender": result7[0].gender,
                                                                                                                    "MobileNo": result7[0].u_MobileNo,
                                                                                                                    "Email": result7[0].u_Email,
                                                                                                                    "Address": result7[0].u_Address,
                                                                                                                    "Cityname": result7[0].Cityname,
                                                                                                                    "Statename": result7[0].Statename,
                                                                                                                    "CountryName": result7[0].CountryName,
                                                                                                                    "Zipcode": result7[0].u_Zipcode,
                                                                                                                    "UserRole": result7[0].UserRole,
                                                                                                                    "Profile_img": result7[0].u_ImagesUrl,
                                                                                                                    "BlueMark": result7[0].u_BlueMark,

                                                                                                                    "Post": {
                                                                                                                        "Id": result8[0].Id,
                                                                                                                        "Text": result8[0].Text,
                                                                                                                        "UserId": result8[0].UserId,
                                                                                                                        "Status": result8[0].Status,
                                                                                                                        "PostTypeId": result8[0].PostTypeId,
                                                                                                                        "PostType": result8[0].PostType,
                                                                                                                        "CreatedBy": result8[0].CreatedBy,
                                                                                                                        "CreatedOn": result8[0].CreatedOn,
                                                                                                                        "PostData": {
                                                                                                                            "Images": result,
                                                                                                                            // "Audios": result1,
                                                                                                                            "Feeling_activity": empji,
                                                                                                                            // "Files": result3,
                                                                                                                            // "Map": result4,
                                                                                                                            "Tag_Friend": result5,
                                                                                                                            "Videos": result6,
                                                                                                                            // "PostBackground": result9,
                                                                                                                            "likes": result10,
                                                                                                                            "comments": newcomments,
                                                                                                                            // "share": []
                                                                                                                        }

                                                                                                                    }
                                                                                                                }

                                                                                                            }
                                                                                                            return resolve(dataset);
                                                                                                            // })
                                                                                                        })
                                                                                                })
                                                                                        })
                                                                                })
                                                                        })
                                                                })
                                                        })
                                                })
                                        })
                                } else {
                                    return resolve({});
                                }


                            })
                    } else {
                        return resolve({});
                    }
                })
        })
    }




    getpostbyuserst(postId, Id) {

        var imagedata = [], videodata = [];
        return new Promise(async (resolve, reject) => {
            const query8 = connt.query('select ust.Id as Id, ust.Text as Text, ust.UserId as UserId, ust.Status as Status, ' +
                'ust.PostType as PostTypeId, pty.Name as PostType,ust.CreatedBy as  CreatedBy, ust.CreatedOn as CreatedOn ' +
                'from user_story as ust left join Master_Post_type as pty on ust.PostType = pty.Id where ust.Id = ? and ust.Status = 1 ORDER BY ust.CreatedOn DESC',
                [postId], (err8, result8) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query8.sql);
                    var resultd8 = result8;

                    const querydn = connt.query('select * from post_image where postId = ? and Status = 1  and ViewBy = 2',
                        [postId], async (err, result) => {
                            //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                            console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n\n\n\n" + querydn.sql);
                            for (var iz = 0; result.length > iz; iz++) {
                                console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n : ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** " + result[iz].CreatedOn);
                                var settime = new Date(result[iz].CreatedOn.getTime() + 1440 * 60000);
                                console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n : ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** " + settime);
                                console.log('\x1b[32m%s\x1b[0m', "\n Database Time :  " + result[iz].CreatedOn);
                                console.log('\x1b[32m%s\x1b[0m', "\n After 24 hours Time :  " + settime)
                                var currentDate = new Date();
                                if (settime >= currentDate) {
                                    var dataimg = await this.detailsimage(result[iz], result[iz].Id, 1, postId);
                                    console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n : 0000000000000000000000000000000000000000000000000 Image DATA 00000000000000000000000000000000000000000000000000000 \n\n" + dataimg)
                                    if (dataimg != null) {
                                        imagedata.push(dataimg);
                                    }
                                }
                            }
                            // const query1 = connt.query('select * from post_audio where postId = ? and ViewBy = 2',
                            //     [postId], (err1, result1) => {
                            //         //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                            //          console.log('\x1b[32m%s\x1b[0m',"\n" + query1.sql);
                            //         var resultd1 = result1;
                            // const query2 = connt.query('SELECT ptfa.Id as Id, ptfa.emojiId as emojiId, ptfa.title as title, memoji.Name as Name FROM post_feeling_activity as ptfa left join master_emoji as memoji on ptfa.emojiId = memoji.Id ' +
                            //     'where ptfa.postId = ? and ptfa.Status = 1  and ptfa.ViewBy = 2',
                            //     [postId], (err2, result2) => {
                            //         for (var r = 0; result2.length > r; r++) {
                            //             var emdata = result2[r].Name;
                            //             emo = emoji.get(emdata);
                            //             var setdata = {
                            //                 Id: result2[r].Id,
                            //                 emojiId: result2[r].emojiId,
                            //                 title: result2[r].title,
                            //                 EmojiICON: emo
                            //             }
                            //             empji.push(setdata);
                            //         }
                            //          console.log('\x1b[32m%s\x1b[0m',"\n" + query2.sql);
                            // var resultd2 = result2;
                            // const query3 = connt.query('select * from post_file where postId = ? and Status = 1  and ViewBy = 2',
                            //     [postId], (err3, result3) => {
                            //         //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                            //          console.log('\x1b[32m%s\x1b[0m',"\n" + query3.sql);
                            //         var resultd3 = result3;

                            // const query4 = connt.query('select * from post_map where postId = ? and Status = 1  and ViewBy = 2',
                            //     [postId], (err4, result4) => {
                            //         //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                            //          console.log('\x1b[32m%s\x1b[0m',"\n" + query4.sql);
                            //         var resultd4 = result4;
                            // const query5 = connt.query('select pt.Id as TagId, pt.TagText, pt.CreatedOn, u.Id as uId, u.UserId as userId, u.Fname as Fistname,' +
                            //     'u.Lname as lastname, u.MobileNo as mobileno, u.Email as email, ct.name as cityname, st.name as statename,' +
                            //     'cus.countryName as countryName, u.Zipcode, u.ImagesUrl from post_tag as pt left join users as u  on pt.FriendId = u.Id ' +
                            //     'left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cus on u.CountryId = cus.countryID ' +
                            //     'where pt.PostId = ? and pt.Status = 1 and pt.ViewBy = 2', //joining
                            //     [postId], (err5, result5) => {
                            //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                            //  console.log('\x1b[32m%s\x1b[0m',"\n" + query5.sql);
                            // var resultd5 = result5;



                            console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n\n *^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^***************************20250233*****************************");
                            const query6 = connt.query('select * from post_video where postId = ? and Status = 1 and ViewBy = 2',
                                [postId], async (err6, result6) => {
                                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                    console.log('\x1b[32m%s\x1b[0m', "\n" + query6.sql);
                                    for (var iv = 0; result6.length > iv; iv++) {
                                        var settime1 = new Date(result6[iv].CreatedOn.getTime() + 1440 * 60000);
                                        console.log('\x1b[32m%s\x1b[0m', "\n Database Time :  " + result6[iv].CreatedOn);
                                        console.log('\x1b[32m%s\x1b[0m', "\n After 24 hours Time :  " + settime1)
                                        var currentDate1 = new Date();
                                        if (settime1 >= currentDate1) {
                                            var datavd = await this.detailsvideo(result6[iv], result6[iv].Id, 2, postId);
                                            console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n : 000000000000000000000000000000000000000000000000 Video DATA 000000000000000000000000000000000000000000000000000000 \n\n" + datavd)
                                            if (datavd != null) {
                                                videodata.push(datavd);
                                            }
                                        }
                                    }
                                    // const query9 = connt.query('select ptbg.Id as Id,ptbg.BackgroundColor as bgcolor,ptbg.Css_tg as csstg,ptbg.bgimageId as bgimgId,' +
                                    //     'ptbg.Status as status,ptbg.ViewBy as viewby,mstbgimg.Url as bgimg from Post_background as ptbg left join Master_BackgroundImg as ' +
                                    //     'mstbgimg on ptbg.bgimageId = mstbgimg.Id where ptbg.postId = ? and ptbg.Status = 1 and ptbg.ViewBy = 2',
                                    //     [postId], (err9, result9) => {
                                    //         //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                    //          console.log('\x1b[32m%s\x1b[0m',"\n" + query9.sql);
                                    //         var resultd9 = result9;

                                    // const query12 = connt.query('select ur.Id as urId, ur.UserId as urUserId, ur.Fname as urFname, ur.Lname as urLname, ' +
                                    //     'ur.ImagesUrl as urImagesUrl, ur.SocketId as urSocketId, ur.FirebaseToken as urFirebaseToken  ' +
                                    //     'from user_story_Seane as uss left join users as ur on uss.CreatedBy = ur.Id ' +
                                    //     'left join user_story as ust on uss.StoryId = ust.Id  where uss.StoryId = ?',
                                    //     [postId], (err12, result12) => {
                                    //          console.log('\x1b[32m%s\x1b[0m',"\n" + query12.sql);
                                    //         var resultd12 = result12;
                                    console.log('\x1b[32m%s\x1b[0m', "\n****************************20250233*****************************");
                                    const query7 = connt.query('select * from USERView where uId = ? and u_Status = 1',
                                        [Id], async (err7, result7) => {
                                            //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                            console.log('\x1b[32m%s\x1b[0m', "\n" + query7.sql);
                                            var resultd7 = result7;

                                            var dataset = {
                                                "USERDATA": {
                                                    "Id": resultd7[0].uId,
                                                    "UserId": resultd7[0].u_UserId,
                                                    "Fistname": resultd7[0].u_Fname,
                                                    "Lastname": resultd7[0].u_Lname,
                                                    "Gender": resultd7[0].gender,
                                                    "MobileNo": resultd7[0].u_MobileNo,
                                                    "Email": resultd7[0].u_Email,
                                                    "Address": resultd7[0].u_Address,
                                                    "Cityname": resultd7[0].Cityname,
                                                    "Statename": resultd7[0].Statename,
                                                    "CountryName": resultd7[0].CountryName,
                                                    "Zipcode": resultd7[0].u_Zipcode,
                                                    "UserRole": resultd7[0].UserRole,
                                                    "Profile_img": resultd7[0].u_ImagesUrl,
                                                    "BlueMark": result7[0].u_BlueMark,
                                                    "Post": {
                                                        "Id": resultd8[0].Id,
                                                        "Text": resultd8[0].Text,
                                                        "UserId": resultd8[0].UserId,
                                                        "Status": resultd8[0].Status,
                                                        "PostTypeId": resultd8[0].PostTypeId,
                                                        "PostType": resultd8[0].PostType,
                                                        "CreatedBy": resultd8[0].CreatedBy,
                                                        "CreatedOn": resultd8[0].CreatedOn,
                                                        "PostData": {
                                                            "Images": imagedata,
                                                            "Videos": videodata,
                                                            // "Audios": resultd1,
                                                            // "Feeling_activity": empji,
                                                            // "Files": resultd3,
                                                            // "Map": resultd4,
                                                            // "Tag_Friend": resultd5,
                                                            // "PostBackground": resultd9,

                                                        }

                                                    }
                                                }

                                            }
                                            return resolve(dataset);
                                        })
                                    // })


                                    // })
                                })
                            // })
                            // })
                            // })
                            // })
                            // })
                        })

                })

        })
    }





    getstoryOnly(postId, Id) {
        // xyz
        var imagedata = [], videodata = [];
        return new Promise(async (resolve, reject) => {
            var empji = [], emo;
            const query8 = connt.query('select ust.Id as Id, ust.Text as Text, ust.UserId as UserId, ust.Status as Status, ' +
                'ust.PostType as PostTypeId, pty.Name as PostType,ust.CreatedBy as  CreatedBy, ust.CreatedOn as CreatedOn ' +
                'from user_story as ust left join Master_Post_type as pty on ust.PostType = pty.Id where ust.Id = ? and ust.Status = 1 ORDER BY ust.CreatedOn DESC',
                [postId], (err8, result8) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query8.sql);
                    var resultd8 = result8;
                    const querydn = connt.query('select * from post_image where postId = ? and Status = 1  and ViewBy = 2',
                        [postId], async (err, result) => {
                            //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                            console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                            for (var iz = 0; result.length > iz; iz++) {
                                var dataimg = await this.detailsimage(result[iz], result[iz].Id, 1, postId);
                                imagedata.push(dataimg);
                            }
                            const query1 = connt.query('select * from post_audio where postId = ? and ViewBy = 2',
                                [postId], (err1, result1) => {
                                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                    console.log('\x1b[32m%s\x1b[0m', "\n" + query1.sql);
                                    var resultd1 = result1;
                                    const query2 = connt.query('SELECT ptfa.Id as Id, ptfa.emojiId as emojiId, ptfa.title as title, memoji.Name as Name FROM post_feeling_activity as ptfa left join master_emoji as memoji on ptfa.emojiId = memoji.Id ' +
                                        'where ptfa.postId = ? and ptfa.Status = 1  and ptfa.ViewBy = 2',
                                        [postId], (err2, result2) => {
                                            for (var r = 0; result2.length > r; r++) {
                                                var emdata = result2[r].Name;
                                                emo = emoji.get(emdata);
                                                var setdata = {
                                                    Id: result2[r].Id,
                                                    emojiId: result2[r].emojiId,
                                                    title: result2[r].title,
                                                    EmojiICON: emo
                                                }
                                                empji.push(setdata);
                                            }
                                            console.log('\x1b[32m%s\x1b[0m', "\n" + query2.sql);
                                            var resultd2 = result2;
                                            const query3 = connt.query('select * from post_file where postId = ? and Status = 1  and ViewBy = 2',
                                                [postId], (err3, result3) => {
                                                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                    console.log('\x1b[32m%s\x1b[0m', "\n" + query3.sql);
                                                    if (result3.length > 0) {

                                                        const query4 = connt.query('select * from post_map where postId = ? and Status = 1  and ViewBy = 2',
                                                            [postId], (err4, result4) => {
                                                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                console.log('\x1b[32m%s\x1b[0m', "\n" + query4.sql);
                                                                var resultd4 = result4;
                                                                const query5 = connt.query('select pt.Id as TagId, pt.TagText, pt.CreatedOn, u.Id as uId, u.UserId as userId, u.Fname as Fistname,' +
                                                                    'u.Lname as lastname, u.MobileNo as mobileno, u.Email as email, ct.name as cityname, st.name as statename,' +
                                                                    'cus.countryName as countryName, u.Zipcode, u.ImagesUrl from post_tag as pt left join users as u  on pt.FriendId = u.Id ' +
                                                                    'left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cus on u.CountryId = cus.countryID ' +
                                                                    'where pt.PostId = ? and pt.Status = 1 and pt.ViewBy = 2', //joining
                                                                    [postId], (err5, result5) => {
                                                                        //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                        console.log('\x1b[32m%s\x1b[0m', "\n" + query5.sql);
                                                                        var resultd5 = result5;
                                                                        const query6 = connt.query('select * from post_video where postId = ? and Status = 1 and ViewBy = 2',
                                                                            [postId], async (err6, result6) => {
                                                                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                                console.log('\x1b[32m%s\x1b[0m', "\n" + query6.sql);
                                                                                for (var iv = 0; result6.length > iv; iv++) {
                                                                                    var datavd = await this.detailsvideo(result6[iv], result6[iv].Id, 2, postId);
                                                                                    if (datavd != null) {
                                                                                        videodata.push(datavd);
                                                                                    }
                                                                                }
                                                                                const query9 = connt.query('select ptbg.Id as Id,ptbg.BackgroundColor as bgcolor,ptbg.Css_tg as csstg,ptbg.bgimageId as bgimgId,' +
                                                                                    'ptbg.Status as status,ptbg.ViewBy as viewby,mstbgimg.Url as bgimg from Post_background as ptbg left join Master_BackgroundImg as ' +
                                                                                    'mstbgimg on ptbg.bgimageId = mstbgimg.Id where ptbg.postId = ? and ptbg.Status = 1 and ptbg.ViewBy = 2',
                                                                                    [postId], (err9, result9) => {
                                                                                        //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                                        console.log('\x1b[32m%s\x1b[0m', "\n" + query9.sql);
                                                                                        var resultd9 = result9;
                                                                                        const query10 = connt.query('select * from Postlike where Plk_PostId = ? and Plk_CommentTo = 2',
                                                                                            [postId], (err10, result10) => {
                                                                                                console.log('\x1b[32m%s\x1b[0m', "\n" + query10.sql);
                                                                                                var resultd10 = result10;
                                                                                                const query11 = connt.query('select * from comments where parentId = 0 and ptcmt_PostId = ? and ptcmt_ViewBy = 2',
                                                                                                    [postId], (err11, result11) => {
                                                                                                        console.log('\x1b[32m%s\x1b[0m', "\n" + query11.sql);
                                                                                                        var resultd11 = result11;
                                                                                                        const query12 = connt.query('select ur.Id as urId, ur.UserId as urUserId, ur.Fname as urFname, ur.Lname as urLname, ' +
                                                                                                            'ur.ImagesUrl as urImagesUrl, ur.SocketId as urSocketId, ur.FirebaseToken as urFirebaseToken  ' +
                                                                                                            'from user_story_Seane as uss left join users as ur on uss.CreatedBy = ur.Id ' +
                                                                                                            'left join user_story as ust on uss.StoryId = ust.Id  where uss.StoryId = ?',
                                                                                                            [postId], (err12, result12) => {
                                                                                                                console.log('\x1b[32m%s\x1b[0m', "\n" + query12.sql);
                                                                                                                var resultd12 = result12;
                                                                                                                console.log('\x1b[32m%s\x1b[0m', "\n****************************20250233*****************************");
                                                                                                                const query7 = connt.query('select * from USERView where uId = ? and u_Status = 1',
                                                                                                                    [Id], (err7, result7) => {
                                                                                                                        //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                                                                                                        console.log('\x1b[32m%s\x1b[0m', "\n" + query7.sql);
                                                                                                                        var resultd7 = result7;
                                                                                                                        var dataset = {
                                                                                                                            "USERDATA": {
                                                                                                                                "Id": resultd7[0].uId,
                                                                                                                                "UserId": resultd7[0].u_UserId,
                                                                                                                                "Fistname": resultd7[0].u_Fname,
                                                                                                                                "Lastname": resultd7[0].u_Lname,
                                                                                                                                "Gender": resultd7[0].gender,
                                                                                                                                "MobileNo": resultd7[0].u_MobileNo,
                                                                                                                                "Email": resultd7[0].u_Email,
                                                                                                                                "Address": resultd7[0].u_Address,
                                                                                                                                "Cityname": resultd7[0].Cityname,
                                                                                                                                "Statename": resultd7[0].Statename,
                                                                                                                                "CountryName": resultd7[0].CountryName,
                                                                                                                                "Zipcode": resultd7[0].u_Zipcode,
                                                                                                                                "UserRole": resultd7[0].UserRole,
                                                                                                                                "Profile_img": resultd7[0].u_ImagesUrl,
                                                                                                                                "BlueMark": result7[0].u_BlueMark,
                                                                                                                                "Post": {
                                                                                                                                    "Id": resultd8[0].Id,
                                                                                                                                    "Text": resultd8[0].Text,
                                                                                                                                    "UserId": resultd8[0].UserId,
                                                                                                                                    "Status": resultd8[0].Status,
                                                                                                                                    "PostTypeId": resultd8[0].PostTypeId,
                                                                                                                                    "PostType": resultd8[0].PostType,
                                                                                                                                    "CreatedBy": resultd8[0].CreatedBy,
                                                                                                                                    "CreatedOn": resultd8[0].CreatedOn,
                                                                                                                                    "PostData": {
                                                                                                                                        "Images": imagedata,
                                                                                                                                        "Feeling_activity": empji,
                                                                                                                                        "Tag_Friend": resultd5,
                                                                                                                                        "Videos": videodata,
                                                                                                                                        "PostBackground": resultd9,

                                                                                                                                    }

                                                                                                                                }
                                                                                                                            }

                                                                                                                        }
                                                                                                                        return resolve(dataset);
                                                                                                                    })
                                                                                                            })
                                                                                                    })
                                                                                            })
                                                                                    })
                                                                            })
                                                                    })
                                                            })
                                                    } else {
                                                        reslove(result3[0].Id)
                                                    }
                                                })
                                        })
                                })
                        })

                })

        })
    }



    //Story Start -================================================================================================================================================================================================================

    getpostbyusermultist(Id, userdata, Friendbyfriend) {
        return new Promise(async (resolve, reject) => {
            post_s = [];
            const querydn = connt.query('select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
                'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, ' +
                'st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl,ust.Id as postId, ust.Text as postText, ust.UserId as postUserId, ust.Status as postStatus, ' +
                'pty.Name as postType, ust.CreatedBy as CreatedBy, ust.CreatedOn  as CreatedOn, ptbg.Id as bgId, ptbg.BackgroundColor as bgcolor, ptbg.bgimageId as bgimg, ptbg.Css_tg as bgcss, ptbg.Status  as bgstatus ' +
                'from user_story as ust ' +
                'left join Master_Post_type as pty on ust.PostType = pty.Id left join Post_background as ptbg on ust.Id = ptbg.postId left join users as u on ust.UserId = u.Id ' +
                'left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                'left join master_user_role as mur on u.RoleId = mur.Id ' +
                'where ust.UserId = ? and ust.Status = 1 ORDER BY ust.CreatedOn DESC;',
                [Id], async (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n Post UserId 123 %%%%%%%%%%%%%%%%%%%%%%%%% " + result.length + " %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% : " + Id, "\n", userdata[0].FId, "\n", userdata[1].FId, "\n", userdata[2].FId);
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    if (result != null && result.length > 0) {
                        if (result[0].uId != null && result[0].postId != null) {
                            for (var rt1 = 0; result.length > rt1; rt1++) {
                                console.log('\x1b[32m%s\x1b[0m', "\n" + { "UserId": result[0].uId, "PostId": result[rt1].postId })
                                // post.push({ "UserId": result[0].uId, "PostId": result[rt1].postId });
                                post_s.push({ "postId": result[rt1].postId, "UserId": Id });
                            }
                            // console.log('\x1b[32m%s\x1b[0m', "\n %%%%%%%%%%%%%%%%%%%%%%%%% " + post_s)
                        }

                        if (userdata != undefined) {
                            console.log('\x1b[32m%s\x1b[0m', "\n\n data : " + userdata[0].FId);
                            for (var ut = 0; userdata.length > ut; ut++) {
                                console.log('\x1b[32m%s\x1b[0m', "\n" + userdata[ut].FId)
                                await this.friendfillpostst(userdata[ut].FId, post_s, Friendbyfriend);

                            }
                        }
                        return resolve(post_s);
                    } else {
                        if (userdata != undefined) {
                            console.log('\x1b[32m%s\x1b[0m', "\n\n data : " + userdata[0].FId);
                            for (var ut = 0; userdata.length > ut; ut++) {
                                console.log('\x1b[32m%s\x1b[0m', "\n" + userdata[ut].FId)
                                await this.friendfillpostst(userdata[ut].FId, post_s, Friendbyfriend);

                            }
                            return resolve(post_s);
                        }
                    }
                })
        })
    }


    friendfillpostst(data, post_s, Friendbyfriend) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query('select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
                'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, ' +
                'st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl,ust.Id as postId, ust.Text as postText, ust.UserId as postUserId, ust.Status as postStatus, ' +
                'pty.Name as postType, ust.CreatedBy as CreatedBy, ust.CreatedOn  as CreatedOn ' +
                'from user_story as ust ' +
                'left join Master_Post_type as pty on ust.PostType = pty.Id left join users as u on ust.UserId = u.Id ' +
                'left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                'left join master_user_role as mur on u.RoleId = mur.Id ' +
                'where ust.UserId = ? and ust.Status = 1;',
                [data], async (err, result) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    console.log('\x1b[32m%s\x1b[0m', "\n Post UserId12 : %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%   : " + data);
                    console.log('\x1b[32m%s\x1b[0m', "\n Post UserId : %%%%%%%%%%%%%%%%% POST %%%%%%%%%%%%%%%%%%   : " + result.length);
                    if (result != null && result.length > 0) {
                        for (var tb = 0; result.length > tb; tb++) {
                            // post.push({ "UserId": result[tb].uId, "PostId": result[tb].postId });
                            post_s.push({ "postId": result[tb].postId, "UserId": data });
                        }
                    }
                    //  console.log('\x1b[32m%s\x1b[0m',"\n Friendbyfriend    " + Friendbyfriend)
                    // if (Friendbyfriend != undefined) {
                    //     if (Friendbyfriend.length > 0 && Friendbyfriend != undefined) {
                    //         for (var t = 0; Friendbyfriend.length > t; t++) {
                    //             // this.getpostfriendbyfriendst(Friendbyfriend[t].FriendId, post_s);
                    //         }
                    //     } else {
                    //          console.log('\x1b[32m%s\x1b[0m',"\n else friend By from " + Friendbyfriend + "\n\n");
                    //     }
                    // }
                    return resolve(post_s);

                })
        })

    }



    // getpostfriendbyfriendst(data, post_s) {
    //      console.log('\x1b[32m%s\x1b[0m',"\nnew set data view  : " + +data + "\n\n");
    //     return new Promise(async (resolve, reject) => {
    //         const querydn = connt.query('select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
    //             'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, ' +
    //             'st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
    //             'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl, ust.Id as postId, ust.Text as postText, ust.UserId as postUserId, ust.Status as postStatus, ' +
    //             'pty.Name as postType, ust.CreatedBy as CreatedBy, ust.CreatedOn  as CreatedOn, ptbg.Id as bgId, ptbg.BackgroundColor as bgcolor, ptbg.Css_tg as bgcss, ptbg.bgimageId as bgimg, ptbg.Status  as bgstatus ' +
    //             'from user_story as ust ' +
    //             'left join Master_Post_type as pty on ust.PostType = pty.Id left join Post_background as ptbg on ust.Id = ptbg.postId left join users as u on ust.UserId = u.Id ' +
    //             'left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
    //             'left join master_user_role as mur on u.RoleId = mur.Id ' +
    //             'where ust.UserId = ? upt.Status = 1 ORDER BY upt.CreatedOn DESC',
    //             [data], async (err, result) => {
    //                  console.log('\x1b[32m%s\x1b[0m',"\n" + querydn.sql);
    //                  console.log('\x1b[32m%s\x1b[0m',"\n Post UserId %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%    : " + data);
    //                 if (result != null && result.length > 0) {
    //                     for (var aa = 0; result.length > aa; aa++) {
    //                          console.log('\x1b[32m%s\x1b[0m',"55555555555555555555555555555555555555555555555555555555555555555555555\n");
    //                          console.log('\x1b[32m%s\x1b[0m',{ "UserId": result[aa].uId, "PostId": result[aa].postId });
    //                         // post.push({ "UserId": result[aa].uId, "PostId": result[aa].postId });
    //                         post_s.push({ "postId": result[aa].postId, "UserId": data });
    //                     }
    //                 }
    //                 return resolve(post_s);
    //             })
    //     })
    // }


    ///Story End -================================================================================================================================================================================================================





    //Start Post - ###############################################################################################################################################################################################################

    getpostbyusermulti(Id, userdata, BlueId) {

        return new Promise(async (resolve, reject) => {
            var querydt;
            post_p = [];
            if (BlueId == 1) {
                querydt = "select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, " +
                    "u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, " +
                    "st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, " +
                    "mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl,upt.Id as postId, upt.Text as postText, upt.UserId as postUserId, upt.Status as postStatus, " +
                    "pty.Name as postType, upt.CreatedBy as CreatedBy, upt.CreatedOn  as CreatedOn " +
                    "from user_post as upt " +
                    "left join Master_Post_type as pty on upt.PostType = pty.Id left join users as u on upt.UserId = u.Id " +
                    "left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID " +
                    "left join master_user_role as mur on u.RoleId = mur.Id " +
                    "where upt.UserId = ? and upt.Status = 1 and u.BlueMark = 1 ORDER BY upt.CreatedOn DESC";
            } else {
                querydt = "select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, " +
                    "u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, " +
                    "st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, " +
                    "mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl,upt.Id as postId, upt.Text as postText, upt.UserId as postUserId, upt.Status as postStatus, " +
                    "pty.Name as postType, upt.CreatedBy as CreatedBy, upt.CreatedOn  as CreatedOn " +
                    "from user_post as upt " +
                    "left join Master_Post_type as pty on upt.PostType = pty.Id left join users as u on upt.UserId = u.Id " +
                    "left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID " +
                    "left join master_user_role as mur on u.RoleId = mur.Id " +
                    "where upt.UserId = ? and upt.Status = 1 ORDER BY upt.CreatedOn DESC";
            }
            const querydn = connt.query(querydt, [Id], async (err, result) => {
                //  console.log('\x1b[32m%s\x1b[0m',"\n Post UserId 123 %%%%%%%%%%%%%%%%%%%%%%%%% " + result.length + " %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% : " + Id, "\n", userdata[0].FId, "\n", userdata[1].FId, "\n", userdata[2].FId);
                console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                if (result != null && result.length > 0) {
                    if (result[0].uId != null && result[0].postId != null) {
                        for (var rt1 = 0; result.length > rt1; rt1++) {
                            console.log('\x1b[32m%s\x1b[0m', "\n" + { "UserId": result[0].uId, "PostId": result[rt1].postId })
                            // post.push({ "UserId": result[0].uId, "PostId": result[rt1].postId });
                            post_p.push(result[rt1].postId);
                        }
                    }

                    if (userdata != undefined) {
                        console.log('\x1b[32m%s\x1b[0m', "\n\n data : " + userdata[0].FId);
                        for (var ut = 0; userdata.length > ut; ut++) {
                            console.log('\x1b[32m%s\x1b[0m', "\n" + userdata[ut].FId)
                            await this.friendfillpost(userdata[ut].FId, post_p, userdata[ut].Friendbyfriend, BlueId);
                        }
                        return resolve(post_p);
                    }

                } else {
                    if (userdata != undefined) {
                        console.log('\x1b[32m%s\x1b[0m', "\n\n data : " + userdata[0].FId);
                        for (var ut = 0; userdata.length > ut; ut++) {
                            console.log('\x1b[32m%s\x1b[0m', "\n" + userdata[ut].FId)
                            await this.friendfillpost(userdata[ut].FId, post_p, userdata[ut].Friendbyfriend, BlueId);
                        }
                        return resolve(post_p);

                    } else {
                        return resolve(post_p);
                    }
                }
            })
        })
    }


    friendfillpost(data, post_p, Friendbyfriend, BlueId) {
        return new Promise(async (resolve, reject) => {
            var querydt;
            if (BlueId == 1) {
                querydt = "select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, " +
                    "u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, " +
                    "st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, " +
                    "mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl,upt.Id as postId, upt.Text as postText, upt.UserId as postUserId, upt.Status as postStatus, " +
                    "pty.Name as postType, upt.CreatedBy as CreatedBy, upt.CreatedOn  as CreatedOn " +
                    "from user_post as upt " +
                    "left join Master_Post_type as pty on upt.PostType = pty.Id left join users as u on upt.UserId = u.Id " +
                    "left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID " +
                    "left join master_user_role as mur on u.RoleId = mur.Id " +
                    "where upt.UserId = ? and upt.Status = 1 and u.BlueMark = 1 ORDER BY upt.CreatedOn DESC";
            } else {
                querydt = "select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, " +
                    "u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, " +
                    "st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, " +
                    "mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl,upt.Id as postId, upt.Text as postText, upt.UserId as postUserId, upt.Status as postStatus, " +
                    "pty.Name as postType, upt.CreatedBy as CreatedBy, upt.CreatedOn  as CreatedOn " +
                    "from user_post as upt " +
                    "left join Master_Post_type as pty on upt.PostType = pty.Id left join users as u on upt.UserId = u.Id " +
                    "left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID " +
                    "left join master_user_role as mur on u.RoleId = mur.Id " +
                    "where upt.UserId = ? and upt.Status = 1 ORDER BY upt.CreatedOn DESC";
            }
            const querydn = connt.query(querydt,
                [data], async (err, result) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    console.log('\x1b[32m%s\x1b[0m', "\n Post UserId12 : %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%   : " + data);
                    console.log('\x1b[32m%s\x1b[0m', "\n Post UserId : %%%%%%%%%%%%%%%%% POST %%%%%%%%%%%%%%%%%%   : " + result.length);
                    if (result != null && result.length > 0) {
                        for (var tb = 0; result.length > tb; tb++) {
                            // post.push({ "UserId": result[tb].uId, "PostId": result[tb].postId });
                            post_p.push(result[tb].postId);
                        }
                    }
                    console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ")
                    console.log('\x1b[32m%s\x1b[0m', "\n Friendbyfriend xyz   : " + Friendbyfriend)
                    if (Friendbyfriend != undefined) {
                        if (Friendbyfriend.length > 0 && Friendbyfriend != undefined) {
                            for (var t = 0; Friendbyfriend.length > t; t++) {
                                this.getpostfriendbyfriend(Friendbyfriend[t].FriendId, post_p, BlueId);
                            }
                            return resolve(post_p);
                        } else {
                            console.log('\x1b[32m%s\x1b[0m', "\n else friend By from " + Friendbyfriend + "\n\n");
                            return resolve(post_p);
                        }

                    } else {
                        return resolve(post_p);
                    }
                })
        })

    }




    getpostfriendbyfriend(data, post_p, BlueId) {
        console.log('\x1b[32m%s\x1b[0m', "\nnew set data view  : " + +data + "\n\n");
        return new Promise(async (resolve, reject) => {
            var querydt;
            if (BlueId == 1) {
                querydt = "select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, " +
                    "u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, " +
                    "st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, " +
                    "mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl,upt.Id as postId, upt.Text as postText, upt.UserId as postUserId, upt.Status as postStatus, " +
                    "pty.Name as postType, upt.CreatedBy as CreatedBy, upt.CreatedOn  as CreatedOn " +
                    "from user_post as upt " +
                    "left join Master_Post_type as pty on upt.PostType = pty.Id left join users as u on upt.UserId = u.Id " +
                    "left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID " +
                    "left join master_user_role as mur on u.RoleId = mur.Id " +
                    "where upt.UserId = ? and upt.Status = 1 and u.BlueMark = 1 ORDER BY upt.CreatedOn DESC";
            } else {
                querydt = "select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, " +
                    "u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, " +
                    "st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, " +
                    "mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl,upt.Id as postId, upt.Text as postText, upt.UserId as postUserId, upt.Status as postStatus, " +
                    "pty.Name as postType, upt.CreatedBy as CreatedBy, upt.CreatedOn  as CreatedOn " +
                    "from user_post as upt " +
                    "left join Master_Post_type as pty on upt.PostType = pty.Id left join users as u on upt.UserId = u.Id " +
                    "left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID " +
                    "left join master_user_role as mur on u.RoleId = mur.Id " +
                    "where upt.UserId = ? and upt.Status = 1  ORDER BY upt.CreatedOn DESC";
            }
            const querydn = connt.query(querydt, [data], async (err, result) => {
                console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                console.log('\x1b[32m%s\x1b[0m', "\n Post UserId %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%    : " + data);
                if (result != null && result.length > 0) {
                    for (var aa = 0; result.length > aa; aa++) {
                        console.log('\x1b[32m%s\x1b[0m', "55555555555555555555555555555555555555555555555555555555555555555555555\n");
                        //  console.log('\x1b[32m%s\x1b[0m',{ "UserId": result[aa].uId, "PostId": result[aa].postId });
                        post_p.push(result[aa].postId);
                    }

                    return resolve(post_p);
                }
                return resolve(post_p);
            })
        })
    }

    //Post End - ###############################################################################################################################################################################################################






    commentsticker(logId, PostId, commentId, StickerImg) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("INSERT INTO post_comment_Sticker(PostId, PostCommentId, StickerImg, CreatedBy, CreatedOn) value(?, ?, ?, ?, current_timestamp())",
                [PostId, commentId, StickerImg, logId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    return resolve(result.insertId);
                })
        });
    }

    commentstickerstory(logId, PostId, commentId, StickerImg) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("INSERT INTO post_comment_Sticker(PostId, PostCommentId, StickerImg, CreatedBy, CreatedOn, ViewBy) value(?, ?, ?, ?, current_timestamp(), 2)",
                [PostId, commentId, StickerImg, logId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    return resolve(result.insertId);
                })
        });
    }

    commentImgVideo(logId, PostId, commentId, ImageVideo, Type) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("INSERT INTO post_comment_ImgVideo(PostId, PostCommentId, ImageVideo, Type, CreatedBy, CreatedOn) value(?, ?, ?, ?, ?, current_timestamp())",
                [PostId, commentId, ImageVideo, Type, logId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    return resolve(result.insertId);
                })
        });
    }

    commentImgVideostory(logId, PostId, commentId, ImageVideo, Type) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("INSERT INTO post_comment_ImgVideo(PostId, PostCommentId, ImageVideo, Type, CreatedBy, CreatedOn, ViewBy) value(?, ?, ?, ?, ?, current_timestamp(),2)",
                [PostId, commentId, ImageVideo, Type, logId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    return resolve(result.insertId);
                })
        });
    }

    commentgif(logId, PostId, commentId, GifUrl) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("INSERT INTO post_comment_gif(PostId, PostCommentId, GifUrl, CreatedBy, CreatedOn) value(?, ?, ?, ?, current_timestamp())",
                [PostId, commentId, GifUrl, logId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    return resolve(result.insertId);
                })
        });
    }

    commentgifstory(logId, PostId, commentId, GifUrl) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("INSERT INTO post_comment_gif(PostId, PostCommentId, GifUrl, CreatedBy, CreatedOn, ViewBy) value(?, ?, ?, ?, current_timestamp(), 2)",
                [PostId, commentId, GifUrl, logId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    return resolve(result.insertId);
                })
        });
    }


    commentemoji(logId, PostId, commentId, emojiId) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("INSERT INTO post_comment_emoji(PostId, PostCommentId, emojiId, CreatedBy, CreatedOn) value(?, ?, ?, ?, current_timestamp())",
                [PostId, commentId, emojiId, logId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    return resolve(result.insertId);
                })
        });
    }

    commentemojistory(logId, PostId, commentId, emojiId) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("INSERT INTO post_comment_emoji(PostId, PostCommentId, emojiId, CreatedBy, CreatedOn, ViewBy) value(?, ?, ?, ?, current_timestamp(), 2)",
                [PostId, commentId, emojiId, logId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    return resolve(result.insertId);
                })
        });
    }


    getsuggestionid(logId, data) {
        return new Promise(async (resolve, reject) => {

            console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n\n\n : ####################################### :")
            const querydn = connt.query("Select * from social_friends_req where UserId = ? and FriendId = ?",
                [logId, data.sfr_FriendId], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    console.log('\x1b[32m%s\x1b[0m', "\n\n : ####################################### : \n\n\n\n" + result.length);
                    if (result.length > 0) {
                        return resolve(0);
                    } else {
                        console.log('\x1b[32m%s\x1b[0m', "\nDATA : " + data.sfr_FriendId)
                        if (data.sfr_FriendId == logId) { return resolve(0); } else { return resolve(data); }

                    }
                })
        });
    }






    uploadDir(s3Path) {
        return new Promise(async (resolve, reject) => {
            let s3 = new AWS.S3();
            function walkSync(s3Path, callback) {
                fs.readdirSync(s3Path).forEach(function (name) {
                    var filePath = path.join(s3Path, name);
                    console.log('\x1b[32m%s\x1b[0m', "\n File Path data " + filePath);
                    var stat = fs.statSync(filePath);
                    if (stat.isFile()) {
                        callback(filePath, stat);
                        console.log('\x1b[32m%s\x1b[0m', " \n\n =====If=========== \n\n\n\n" + filePath, callback + "\n\n\n========================\n\n\n ");
                    } else if (stat.isDirectory()) {
                        console.log('\x1b[32m%s\x1b[0m', " \n\n =======Else If========= \n\n\n\n" + filePath, callback + "\n\n\n========================\n\n\n ");
                        walkSync(filePath, callback);
                    }
                });
            }

            walkSync(s3Path, function (filePath, stat) {
                console.log('\x1b[32m%s\x1b[0m', "\n\n" + "Walk Sync" + s3Path, "\n" + filePath, "\n" + stat)
                let bucketPath = filePath.substring(s3Path.length - 1);
                console.log('\x1b[32m%s\x1b[0m', "\n \n Bucketpath Name   : " + bucketPath + "\n");
                let params = {
                    ACL: 'public-read',
                    Bucket: 'ritzvrbucket/mpd',
                    ContentType: '*',
                    ContentDisposition: 'attachment',
                    Key: bucketPath,
                    Body: fs.readFileSync(filePath)
                };
                s3.putObject(params, function (err, data) {
                    if (err) {
                        console.log('\x1b[32m%s\x1b[0m', err)
                        return resolve("File Not Found");
                    } else {
                        console.log('\x1b[32m%s\x1b[0m', 'Successfully uploaded ' + bucketPath);
                        return resolve(bucketPath);
                    }
                });

            });
        });
    };


    replytoreply(data) {
        return new Promise(async (resolve, reject) => {
            var replyarray = [];
            for (var yo = 0; data.length > yo; yo++) {
                // var rt = await this.replytoreply1(data[yo]);
                // replyarray.push(rt);
            }
            return resolve(replyarray);
        });
    }



    // replytoreply1(data) {
    //     return new Promise(async (resolve, reject) => {
    //         const querydn = connt.query("select * from comments where ptcmt_childId = ?",
    //             [data.ptcmt_Id], (err, result) => {
    //                 //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
    //                  console.log('\x1b[32m%s\x1b[0m',"\n" + querydn.sql);
    //                 if (result.length > 1) {

    //                 } else {
    //                     return resolve(data);
    //                 }
    //             })
    //     });
    // }



    // replytoreply2(data) {
    //     return new Promise(async (resolve, reject) => {
    //         var replyarray2 = [];
    //         for (var yo2 = 0; data.length > yo2; yo2++) {

    //         }
    //     });
    // }

    getpartvd(Id, io) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("select * from Video_users where vdoId = ?",
                [Id], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    if (result.length > 0) {
                        return resolve(result);
                    } else {
                        return resolve(0);
                    }
                })
        });
    }

    getpartImg(Id) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("select * from Images_users where img_Id = ?",
                [Id], (err, result) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    if (result.length > 0) {
                        return resolve(result);
                    } else {
                        return resolve(0);
                    }
                })
        });
    }




    setmutualfriend(Id) {
        return new Promise(async (resolve, reject) => {
            const query3 = connt.query('select * from USERView where uId = ?',
                [Id], (err3, result3) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query3.sql);
                    if (result3.length > 0) {
                        return resolve(result3);

                    }
                })
        })
    }



    detailsimage(data, PartId, parttype, storyId) {
        return new Promise(async (resolve, reject) => {
            var userdata = [];
            const query10 = connt.query('select  u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
                'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, st.name as Statename,' +
                'u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.BlueMark as u_BlueMark, u.RoleId as u_RoleId, urStptSc.CreatedBy as seaneCreatedBy, urStptSc.CreatedOn as seaneCreatedOn, ' +
                'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl from user_story_part_Seane as urStptSc left join users as u on urStptSc.CreatedBy = u.Id left join cities as ct on u.CityId = ct.id ' +
                'left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                'left join master_user_role as mur on u.RoleId = mur.Id where urStptSc.StoryId = ? and urStptSc.PartId = ? and urStptSc.PartTypeId = ? and urStptSc.Status = 1',
                [storyId, PartId, parttype], async (err10, result10) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query10.sql);
                    if (result10.length > 0) {
                        for (var it = 0; result10.length > it; it++) {
                            console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n\n\n\n\n\n\ 999999999999999999999999999999999999999999 : " + storyId, PartId, result10[it], parttype);
                            var ddt = await this.detailsuserlikecommentimg(storyId, PartId, result10[it], parttype)
                            // console.log('\x1b[32m%s\x1b[0m', ddt);
                            userdata.push(ddt);
                        }
                        var datase = {
                            "Id": data.Id,
                            "Image": data.Imagename,
                            "Title": data.Title,
                            "Description": data.Description,
                            "CreatedOn": data.CreatedOn,
                            "USER": userdata
                        }
                        return resolve(datase);
                    } else {
                        var datasee = {
                            "Id": data.Id,
                            "Image": data.Imagename,
                            "Title": data.Title,
                            "Description": data.Description,
                            "CreatedOn": data.CreatedOn,
                            "USER": []
                        }
                        return resolve(datasee);
                    }
                })
        })
    }


    detailsvideo(data, PartId, parttype, storyId) {
        return new Promise(async (resolve, reject) => {
            var userdata = [];

            console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n\n\n !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            const query10 = connt.query('select  u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
                'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId,u.BlueMark as u_BlueMark ,st.name as Statename,' +
                'u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, urStptSc.CreatedBy as seaneCreatedBy ,urStptSc.CreatedOn as  seaneCreatedOn, ' +
                'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl from user_story_part_Seane as urStptSc left join users as u on urStptSc.CreatedBy = u.Id left join cities as ct on u.CityId = ct.id ' +
                'left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                'left join master_user_role as mur on u.RoleId = mur.Id where urStptSc.StoryId = ? and urStptSc.PartId = ? and urStptSc.PartTypeId = ? and urStptSc.Status = 1',
                [storyId, PartId, parttype], async (err10, result10) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query10.sql);
                    if (result10.length > 0) {
                        for (var iit = 0; result10.length > iit; iit++) {
                            var ddt = await this.detailsuserlikecomment(storyId, PartId, result10[iit], parttype)
                            userdata.push(ddt);
                        }
                        var datavdo = {
                            "Id": data.Id,
                            "Video": data.videoname,
                            "Thumbnai": data.Thumbnai,
                            "Videolength": data.Videolength,
                            "Title": data.Title,
                            "Description": data.Description,
                            "CreatedOn": data.CreatedOn,
                            "USER": userdata
                        }
                        return resolve(datavdo);
                    } else {
                        return resolve();
                    }
                })
        })
    }


    detailsuserlikecomment(storyid, partid, data, partitem) {
        return new Promise(async (resolve, reject) => {
            var like = "0";
            var newdate = "00-00-0000";
            const querydn = connt.query('select * from Self_Like where PostId = ? and PostPartId = ? and PartItemId = ? and ViewType = 2 and Status = 1 and CreatedBy = ?',
                [storyid, partid, partitem, data.seaneCreatedBy], (err, result) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    if (result.length > 0) {
                        like = "1";
                        newdate = result[0].CreatedOn;
                    }
                    const query2 = connt.query('select  u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, ' +
                        'u.MobileNo as u_MobileNo, u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ' +
                        'u.StateId as u_StateId, u.CountryId as u_CountryId, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                        'u.ImagesUrl as u_ImagesUrl, ptcmt.CommentText as commentText, scmt.CreatedOn as scmtCreatedOn ' +
                        'from SelfComments as scmt left join Post_comments as ptcmt on scmt.CommentId = ptcmt.Id left join users as u on scmt.CreatedBy = u.Id  ' +
                        'where scmt.PostId = ? and scmt.PostPartId = ? and scmt.PartItemId = ? and scmt.Status = 1 and scmt.ViewType = 2 and scmt.CreatedBy = ?',
                        [storyid, partid, partitem, data.seaneCreatedBy], (err2, result2) => {
                            console.log('\x1b[32m%s\x1b[0m', "\n" + query2.sql);
                            if (result2.length > 0) {
                                var rtdata = {
                                    userId: data.seaneCreatedBy,
                                    Fistname: data.u_Fname,
                                    Lastname: data.u_Lname,
                                    image: data.u_ImagesUrl,
                                    BlueMark: data.u_BlueMark,
                                    Seance: data.seaneCreatedOn,
                                    like: { like: like, CreatedOn: newdate },
                                    comment: result2
                                }
                            } else {
                                var rtdata = {
                                    userId: data.seaneCreatedBy,
                                    Fistname: data.u_Fname,
                                    Lastname: data.u_Lname,
                                    image: data.u_ImagesUrl,
                                    BlueMark: data.u_BlueMark,
                                    Seance: data.seaneCreatedOn,
                                    like: { like: like, CreatedOn: newdate },
                                    comment: []
                                }
                            }
                            return resolve(rtdata);
                        })
                })
        })
    }





    detailsuserlikecommentimg(storyid, partid, data, partitem) {
        return new Promise(async (resolve, reject) => {
            var like = "0";
            var newdate = "00-00-0000";
            const querydn = connt.query('select * from Self_Like where PostId = ? and PostPartId = ? and PartItemId = ? and ViewType = 2 and Status = 1 and CreatedBy = ?',
                [storyid, partid, partitem, data.seaneCreatedBy], (err, result) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    if (result.length > 0) {
                        like = "1";
                        newdate = result[0].CreatedOn;
                    }

                    const query2 = connt.query('select  u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, ' +
                        'u.MobileNo as u_MobileNo, u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ' +
                        'u.StateId as u_StateId, u.CountryId as u_CountryId, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId,  u.BlueMark as u_BlueMark, ' +
                        'u.ImagesUrl as u_ImagesUrl, ptcmt.CommentText as commentText, scmt.CreatedOn as scmtCreatedOn ' +
                        'from SelfComments as scmt left join Post_comments as ptcmt on scmt.CommentId = ptcmt.Id left join users as u on scmt.CreatedBy = u.Id  ' +
                        'where scmt.PostId = ? and scmt.PostPartId = ? and scmt.PartItemId = ? and scmt.Status = 1 and scmt.ViewType = 2 and scmt.CreatedBy = ? order by scmt.CreatedOn DESC',
                        [storyid, partid, partitem, data.seaneCreatedBy], (err2, result2x) => {
                            console.log('\x1b[35m%s\x1b[0m', "\n=============================Comment datas et  ===============================");
                            console.log('\x1b[32m%s\x1b[0m', "\n" + query2.sql);
                            if (result2x.length > 0) {
                                var rtdata = {
                                    userId: data.seaneCreatedBy,
                                    Fistname: data.u_Fname,
                                    Lastname: data.u_Lname,
                                    image: data.u_ImagesUrl,
                                    // stdata: "======================",
                                    BlueMark: data.u_BlueMark,
                                    Seance: data.seaneCreatedOn,
                                    like: { like: like, CreatedOn: newdate },
                                    comment: result2x
                                }
                            } else {
                                var rtdata = {
                                    userId: data.seaneCreatedBy,
                                    Fistname: data.u_Fname,
                                    Lastname: data.u_Lname,
                                    image: data.u_ImagesUrl,
                                    // stdata: "======================",
                                    BlueMark: data.u_BlueMark,
                                    Seance: data.seaneCreatedOn,
                                    like: { like: like, CreatedOn: newdate },
                                    comment: []
                                }
                            }
                            console.log('\x1b[32m%s\x1b[0m', "\n\n\n\n\n\n\n\n var data : " + rtdata)
                            return resolve(rtdata);
                        })
                })
        })
    }


    detailsimagepost(data, partitem) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query('select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo,' +
                'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, ' +
                'st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl, mstemji.Name as Emoji_text from Self_Like as slk left join users as u on slk.CreatedBy = u.Id ' +
                'left join master_emoji as mstemji on slk.EmojiId = mstemji.Id left join cities as ct on u.CityId = ct.id ' +
                'left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                'left join master_user_role as mur on u.RoleId = mur.Id  where slk.PostId = ? and slk.PostPartId = ? and slk.PartItemId = ? and slk.Status = 1 and slk.ViewType = 1',
                [data.postId, data.Id, partitem], (err, result) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    const query2 = connt.query('select  u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
                        'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, ' +
                        'st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                        'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl, ptcmt.CommentText as commentText from SelfComments as scmt left join Post_comments as ptcmt on scmt.CommentId = ptcmt.Id ' +
                        'left join users as u on scmt.CreatedBy = u.Id left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                        'left join master_user_role as mur on u.RoleId = mur.Id where scmt.PostId = ? and scmt.PostPartId = ? and scmt.PartItemId = ? and scmt.Status = 1 and scmt.ViewType = 1',
                        [data.postId, data.Id, partitem], (err2, result2) => {
                            console.log('\x1b[32m%s\x1b[0m', "================Comments data ===============================================================================\n\n\n\n\n\n\n\n\n\n\n")
                            console.log('\x1b[32m%s\x1b[0m', "\n" + query2.sql);
                            const query3 = connt.query('select  u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
                                'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, st.name as Statename,' +
                                'u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                                'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl from user_post_part_Seane as urStptSc left join users as u on urStptSc.CreatedBy = u.Id left join cities as ct on u.CityId = ct.id ' +
                                'left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                                'left join master_user_role as mur on u.RoleId = mur.Id where urStptSc.StoryId = ? and urStptSc.PartId = ? and urStptSc.PartTypeId = ? and urStptSc.Status = 1',
                                [data.postId, data.Id, partitem], (err3, result3) => {
                                    console.log('\x1b[32m%s\x1b[0m', "================Comments Seanc ===============================================================================\n\n\n\n\n\n\n\n\n\n\n")
                                    console.log('\x1b[32m%s\x1b[0m', "\n" + query3.sql);
                                    var datase = {
                                        "Id": data.Id,
                                        "Image": data.Imagename,
                                        "Title": data.Title,
                                        "Description": data.Description,
                                        "CreatedOn": data.CreatedOn,
                                        "Like": result,
                                        "Comments": result2,
                                        "Seanc": result3
                                    }
                                    return resolve(datase);
                                })
                        })
                })
        })
    }


    detailsvideopost(data, partitem) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query('select u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo,' +
                'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, ' +
                'st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl, mstemji.Name as Emoji_text from Self_Like as slk left join users as u on slk.CreatedBy = u.Id ' +
                'left join master_emoji as mstemji on slk.EmojiId = mstemji.Id left join cities as ct on u.CityId = ct.id ' +
                'left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                'left join master_user_role as mur on u.RoleId = mur.Id  where slk.PostId = ? and slk.PostPartId = ? and slk.PartItemId = ? and slk.Status = 1 and slk.ViewType = 2',
                [data.postId, data.Id, partitem], (err, result) => {
                    console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                    const query2 = connt.query('select  u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
                        'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, ' +
                        'st.name as Statename, u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                        'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl, ptcmt.CommentText as commentText from SelfComments as scmt left join Post_comments as ptcmt on scmt.CommentId = ptcmt.Id ' +
                        'left join users as u on scmt.CreatedBy = u.Id left join cities as ct on u.CityId = ct.id left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                        'left join master_user_role as mur on u.RoleId = mur.Id where scmt.PostId = ? and scmt.PostPartId = ? and scmt.PartItemId = ? and scmt.Status = 1 and scmt.ViewType = 2',
                        [data.postId, data.Id, partitem], (err2, result2) => {
                            console.log('\x1b[32m%s\x1b[0m', "\n" + query2.sql);
                            const query3 = connt.query('select  u.Id as uId, u.UserId as u_UserId, u.Fname as u_Fname, u.Lname as u_Lname, u.genderId as u_genderId, u.MobileNo as u_MobileNo, ' +
                                'u.Email as u_Email, u.Address u_Address, u.DOB as u_DOB, u.CityId as u_CityId, ct.name as Cityname, u.StateId as u_StateId, st.name as Statename,' +
                                'u.CountryId as u_CountryId, cst.countryName as CountryName, u.Zipcode as u_Zipcode, u.RoleId as u_RoleId, ' +
                                'mur.Role as UserRole, u.ImagesUrl as u_ImagesUrl from user_post_part_Seane as urStptSc left join users as u on urStptSc.CreatedBy = u.Id left join cities as ct on u.CityId = ct.id ' +
                                'left join state as st on u.StateId = st.id left join countries as cst on u.CountryId = cst.countryID ' +
                                'left join master_user_role as mur on u.RoleId = mur.Id where urStptSc.StoryId = ? and urStptSc.PartId = ? and urStptSc.PartTypeId = ? and urStptSc.Status = 1',
                                [data.postId, data.Id, partitem], (err3, result3) => {
                                    console.log('\x1b[32m%s\x1b[0m', "\n" + query3.sql);
                                    var datavdo = {
                                        "Id": data.Id,
                                        "Video": data.videoname,
                                        "Thumbnai": data.Thumbnai,
                                        "Videolength": data.Videolength,
                                        "Title": data.Title,
                                        "Description": data.Description,
                                        "CreatedOn": data.CreatedOn,
                                        "Like": result,
                                        "Comments": result2,
                                        "Seanc": result3
                                    }
                                    return resolve(datavdo);
                                })
                        })
                })
        })
    }






    postteg(RowId, Id) {
        return new Promise(async (resolve, reject) => {
            const query10 = connt.query('select * from post_tag where Status = 1 and PostId = ? and UserId = ?',
                [RowId, Id], async (err10, result10) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query10.sql);
                    if (result10.length > 0) {
                        const query2 = connt.query('update post_tag set Status = 0, DeleteBy = ?, DeleteOn = current_timestamp() where PostId = ?',
                            [Id, RowId], async (err2, result2) => {
                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                console.log('\x1b[32m%s\x1b[0m', "\n" + query2.sql);
                                if (result2) {
                                    return resolve(true);
                                } else {
                                    return resolve(false);
                                }
                            })
                    } else {
                        return resolve(true);
                    }
                })
        })
    }


    postvideo(RowId, Id) {
        return new Promise(async (resolve, reject) => {
            const query11 = connt.query('select * from post_video where Status = 1 and PostId = ? and CreatedBy = ?',
                [RowId, Id], async (err11, result11) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query11.sql);
                    if (result11.length > 0) {
                        const query3 = connt.query('update post_video set Status = 0, DeleteBy = ?, DeleteOn = current_timestamp() where PostId = ?',
                            [Id, RowId], async (err3, result3) => {
                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                console.log('\x1b[32m%s\x1b[0m', "\n" + query3.sql);
                                if (result3) {
                                    return resolve(true);
                                } else {
                                    return resolve(false);
                                }
                            })
                    } else {
                        return resolve(true);
                    }
                })
        })
    }


    postmap(RowId, Id) {
        return new Promise(async (resolve, reject) => {
            const query12 = connt.query('select * from post_map where Status = 1 and PostId = ? and CreatedBy = ?',
                [RowId, Id], async (err12, result12) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query12.sql);
                    if (result12.length > 0) {
                        const query4 = connt.query('update post_map set Status = 0, DeleteBy = ?, DeleteOn = current_timestamp() where PostId = ?',
                            [Id, RowId], async (err4, result4) => {
                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                console.log('\x1b[32m%s\x1b[0m', "\n" + query4.sql);
                                if (result4) {
                                    return resolve(true);
                                } else {
                                    return resolve(false);
                                }
                            })
                    } else {
                        return resolve(true);
                    }
                })
        })
    }


    postimage(RowId, Id) {
        return new Promise(async (resolve, reject) => {
            const query13 = connt.query('select * from post_image where Status = 1 and PostId = ? and CreatedBy = ?',
                [RowId, Id], async (err13, result13) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query13.sql);
                    if (result13.length > 0) {
                        const query5 = connt.query('update post_image set Status = 0, DeleteBy = ?, DeleteOn = current_timestamp() where PostId = ?',
                            [Id, RowId], async (err5, result5) => {
                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                console.log('\x1b[32m%s\x1b[0m', "\n" + query5.sql);
                                if (result5) {
                                    return resolve(true);
                                } else {
                                    return resolve(false);
                                }
                            })
                    } else {
                        return resolve(true);
                    }
                })
        })
    }


    postfile(RowId, Id) {
        return new Promise(async (resolve, reject) => {
            const query14 = connt.query('select * from post_file where Status = 1 and PostId = ? and CreatedBy = ?',
                [RowId, Id], async (err14, result14) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query14.sql);
                    if (result14.length > 0) {
                        const query6 = connt.query('update post_file set Status = 0, DeleteBy = ?, DeleteOn = current_timestamp() where PostId = ?',
                            [Id, RowId], async (err6, result6) => {
                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                console.log('\x1b[32m%s\x1b[0m', "\n" + query6.sql);
                                if (result6) {
                                    return resolve(true);
                                } else {
                                    return resolve(false);
                                }
                            })
                    } else {
                        return resolve(true);
                    }
                })

        })
    }


    postfeelingactivity(RowId, Id) {
        return new Promise(async (resolve, reject) => {
            const query15 = connt.query('select * from post_feeling_activity where Status = 1 and PostId = ? and CreatedBy = ?',
                [RowId, Id], async (err15, result15) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query15.sql);
                    if (result15.length > 0) {
                        const query7 = connt.query('update post_feeling_activity set Status = 0, DeleteBy = ?, DeleteOn = current_timestamp() where PostId = ?',
                            [Id, RowId], async (err7, result7) => {
                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                console.log('\x1b[32m%s\x1b[0m', "\n" + query7.sql);
                                if (result7) {
                                    return resolve(true);
                                } else {
                                    return resolve(false);
                                }
                            })
                    } else {
                        return resolve(true);
                    }
                })
        })
    }


    postaudio(RowId, Id) {
        return new Promise(async (resolve, reject) => {
            const query18 = connt.query('select * from post_audio where Status = 1 and PostId = ? and CreatedBy = ?',
                [RowId, Id], async (err18, result18) => {
                    //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                    console.log('\x1b[32m%s\x1b[0m', "\n" + query18.sql);
                    if (result18.length > 0) {
                        const query8 = connt.query('update post_audio set Status = 0, DeleteBy = ?, DeleteOn = current_timestamp() where PostId = ?',
                            [Id, RowId], async (err8, result8) => {
                                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                                console.log('\x1b[32m%s\x1b[0m', "\n" + query8.sql);
                                if (result8) {
                                    return resolve(true);
                                } else {
                                    return resolve(false);
                                }
                            })
                    } else {
                        return resolve(true);
                    }
                })
        })
    }

    getfrienddetails(friendId, Id) {
        return new Promise(async (resolve, reject) => {
            var friendlist = [];
            const querydn = connt.query("select * from social_friends_req where UserId = ? and AcceptStatus = 2 and Status = 1", [friendId], (err1, result1) => {
                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                return resolve(result1);
            })
        });
    }

    getfriendstofriends(Id, socket, io, start) {
        return new Promise(async (resolve, reject) => {
            var postarrye = [];
            try {
                const querydn = connt.query('select * from social_friends_req where UserId = ? and AcceptStatus = 2 and Status = 1',
                    [Id], async (err, result) => {
                        //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                        console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                        if (result.length > 0) {
                            for (var t = 0; result.length > t; t++) {
                                var friendCollection = await this.getfrienddetails(result[t].FriendId, Id);
                                postarrye.push({ "FId": result[t].FriendId, "Friendbyfriend": friendCollection });

                                var userdata = {
                                    userId: Id,
                                    friends: postarrye
                                };
                            }
                            var UserIdList = await this.filluser(userdata);
                            var end = μ.parse(Date.now()).toString();
                            socket.emit("friends", {
                                ApiStart: start,
                                ApiEnd: end,
                                status: true,
                                message: "Data Found",
                                code: 200,
                                result: UserIdList
                            })
                        } else {
                            var userdat = {
                                userId: Id,
                                friends: []
                            }
                            var UserIdLists = await this.filluser(userdat);
                            var end = μ.parse(Date.now()).toString();
                            socket.emit("friends", {
                                ApiStart: start,
                                ApiEnd: end,
                                status: true,
                                message: "User Friends Not Found",
                                code: 200,
                                result: UserIdLists
                            })
                        }
                    })
            } catch (e) {
                var end = μ.parse(Date.now()).toString();
                socket.emit("friends", {
                    ApiStart: start,
                    ApiEnd: end,
                    status: false,
                    message: "error",
                    code: 200,
                    result: e
                })
            }
        })
    }


    filluser(data) {
        return new Promise(async (resolve, reject) => {
            var UserList = [];
            UserList.push({ Id: data.userId });
            if (data.friends.length > 0) {
                for (var jt = 0; data.friends.length > jt; jt++) {
                    console.log('\x1b[32m%s\x1b[0m', "\n Friend Id : " + data.friends[jt].FId);
                    UserList.push({ Id: data.friends[jt].FId })
                    if (data.friends[jt].Friendbyfriend.length > 0) {
                        for (var jr = 0; data.friends[jt].Friendbyfriend.length > jr; jr++) {
                            console.log('\x1b[32m%s\x1b[0m', "\n Friendbyfriend Id : " + data.friends[jt].Friendbyfriend[jr].FriendId);
                            UserList.push({ Id: data.friends[jt].Friendbyfriend[jr].FriendId });
                        }
                    }
                }
                return resolve(UserList);
            } else {
                return resolve(UserList);
            }
        })
    }




    UserBackgroundCoverImgId(Id) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("select * from Master_BackgroundImg where Id = ?", [Id], (err, result) => {
                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                return resolve(result);
            })
        });
    }







    videoViews(Id) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("select * from user_post_part_Seane where PartId = ?", [Id], (err, result) => {
                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                return resolve(result);
            })
        });
    }
    videoLikes(Id) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("select * from Self_Like where ViewType = 1 and Id = ?", [Id], (err, result) => {
                //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
                console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
                return resolve(result);
            })
        });
    }
    videoComments(Id) {
        return new Promise(async (resolve, reject) => {
            const querydn = connt.query("SELECT PtCt.Id as CommentId,  PtCt.CommentText, u.Fname, u.Lname, u.ImagesUrl, u.BlueMark "+
            "FROM SelfComments as sct left join Post_comments as PtCt on sct.CommentId = PtCt.Id left join users as u on sct.CreatedBy = u.Id "+ 
            "where sct.PostPartId = ? and sct.ViewType = 1 and PtCt.ViewBy = 1",  [Id], (err, result) => {
            //  console.log('\x1b[32m%s\x1b[0m',"\n*********************************************************");
            console.log('\x1b[32m%s\x1b[0m', "\n" + querydn.sql);
            return resolve(result);
        })
    });
}
}
module.exports = new CodeSet();