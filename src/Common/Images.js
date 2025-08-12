// var bodyparser = require('body-parser');
// var fs = require('fs');
// var multer = require('multer');
// var sharp = require('sharp');
// const sizeOf = require('image-size')
// const busboy = require('connect-busboy');
// const s3Storage = require('multer-sharp-s3');
// // const storage = s3Storage(options);
// const AWS = require('aws-sdk');
// const setdata = require('../Common/Comments')




// AWS.config.update({
//     "accessKeyId": '',
//     "secretAccessKey": '',
//     "region": 'ap-south-1',
// });
// const s3 = new AWS.S3();

// // const storage = s3Storage({
// //     s3: s3,
// //     acl: 'public-read',
// //     bucket: 'ritzvrbucket/test',
// //     ContentType: '*',
// //     ContentDisposition: 'attachment',
// //     key: Date.now().toString() + file.originalname
// // })
// // const upload = multer({ storage: storage })



// // const storage = s3Storage({
// //     Key: (req, file, cb) => {
// //         crypto.pseudoRandomBytes(16, (err, raw) => {
// //             cb(err, err ? undefined : raw.toString('hex'))
// //         })
// //     },
// //     s3: s3,
// //     bucket: 'ritzvrbucket/test',
// //     multiple: true,
// //     acl: 'public-read',
// //     ContentType: '*',
// //     ContentDisposition: 'attachment',
// //     resize: [
// //         { suffix: 'xlg', width: 1200, height: 1200 },
// //         { suffix: 'lg', width: 800, height: 800 },
// //         { suffix: 'md', width: 500, height: 500 },
// //         { suffix: 'sm', width: 300, height: 300 },
// //         { suffix: 'xs', width: 100 },
// //         { suffix: 'original' }
// //     ],
// // });
// // const upload = multer({ storage });



// // const upload = multer({ dest: './images' })

// module.exports = function (app, db) {
//     app.use(busboy({
//         highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
//     }));
//     app.use(bodyparser.urlencoded({ extended: true }));

//     app.get('/imgupload1', (req, res) => {
//         // upload.single("avatar"),
//         //  console.log('\x1b[32m%s\x1b[0m',"REQFile : " + req.file.path);
//         // fs.rename(req.file.path, './images/avatar.jpg', (err) => {
//         //      console.log('\x1b[32m%s\x1b[0m',err);
//         // })

//         // const dimensions = sizeOf('./images/avatar.jpg')
//         //  console.log('\x1b[32m%s\x1b[0m',dimensions.width, dimensions.height);

//         fs.readdir('./images/', (err, files) => {
//             files.forEach(file => {
//                 sharp('./images/' + file).resize(1000).jpeg({ quality: 50 }).toFile('./images/' + "100_" + file);

//                 sharp('./images/' + file).resize(500).jpeg({ quality: 60 }).toFile('./images/' + '60_' + file);

//                 sharp('./images/' + file).resize(250).jpeg({ quality: 70}).toFile('./images/' + '40_' + file);

//                 sharp('./images/' + file).resize(100).jpeg({ quality: 80 }).toFile('./images/' + '30_' + file);

//                 sharp('./images/' + file).resize(50).jpeg({ quality: 90 }).toFile('./images/' + '10_' + file);

//                 sharp('./images/' + file).resize(30).jpeg({ quality: 100 }).toFile('./images/' + '0_' + file);
//             });
//         });



//         return res.json("File Uploaded Successfully!");
//     });




//     // const uploadimg = multer({
//     //     storage: s3Storage({
//     //         s3: s3,
//     //         acl: 'public-read',
//     //         bucket: 'ritzvrbucket/Images',
//     //         ContentType: '*',
//     //         ContentDisposition: 'attachment',
//     //         metadata: (req, file, cb) => {
//     //             cb(null, { fieldName: file.fieldname })
//     //         },
//     //         key: (req, file, cb) => {
//     //             cb(null, Date.now().toString() + file.originalname)
//     //         }
//     //     }),
//     //     multiple: true,
//     //     resize: [
//     //         { suffix: 'xlg', width: 1200, height: 1200 },
//     //         { suffix: 'lg', width: 800, height: 800 },
//     //         { suffix: 'md', width: 500, height: 500 },
//     //         { suffix: 'sm', width: 300, height: 300 },
//     //         { suffix: 'xs', width: 100 },
//     //         { suffix: 'original' }
//     //     ],
//     // });

//     // const storage = s3Storage({

//     //     s3,
//     //     Bucket: config.uploads.aws.Bucket,
//     //     Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myImage`,
//     //     ACL: config.uploads.aws.ACL,
//     //     s3: s3,
//     //     bucket: 'ritzvrbucket/test',

//     //     acl: 'public-read',
//     //     multiple: true,
//     //     resize: [
//     //         { suffix: 'xlg', width: 1200, height: 1200 },
//     //         { suffix: 'lg', width: 800, height: 800 },
//     //         { suffix: 'md', width: 500, height: 500 },
//     //         { suffix: 'sm', width: 300, height: 300 },
//     //         { suffix: 'xs', width: 100 },
//     //         { suffix: 'original' }
//     //     ],
//     // });
//     // // const upload = multer({ storage });

//     // app.post('/uploadmultiplesize', uploadimg.single('myPic'), (req, res, next) => {
//     //      console.log('\x1b[32m%s\x1b[0m',req.file); // print output
//     //     res.send('Successfully uploaded!');
//     // });

//  app.get('/updateimgin', async(req, res, next) => {
//       var data =  await setdata.udpatei();
//       res.send(data);
//     });




// }