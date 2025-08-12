import AWS from 'aws-sdk';
import path from 'path';

AWS.config.update({
    "accessKeyId": '',
    "secretAccessKey": '',
    "region": 'ap-south-1',
});

const awsuploader = {
    async fileuploader(file, filename) {
        var s3;
        return new Promise((resolve, reject) => {
            s3 = new AWS.S3({
                params: {
                    ACL: 'public-read',
                    Bucket: 'your-bucket-name', // replace with your bucket name
                    ContentEncoding: 'base64',
                    Contenttype: '*',
                    Contentdisposition: 'attachment',
                    Key: Date.now().toString() + path.extname(filename.filename),
                    Body: file

                },
                options: { partSize: 100 * 1024 * 1024, queueSize: 1000 }   // 100 MB
            });
            s3.upload().on('httpUploadProgress', function (evt) {
                console.log(evt);
                // socket.emit(resemit, evt);
            }).send(async (err, data) => {
                // console.log("\n^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n");
                // console.log(data);
                if (!err) {
                    return resolve({
                        "Location": data.Location,
                        "Filename": data.Key.split('/')[1],
                        "Message": "Successfully",
                        "status": true
                    });
                } else {
                    return reject(err);
                }
            })
        })
    }
}

export default awsuploader;