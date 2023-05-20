const aws = require('aws-sdk');
const dotenv = require("dotenv");
dotenv.config()
const secret = process.env.secreat;
const accessKeyId = process.env.acessId

const uploadFile = async (files) => {

    return new Promise(function (resolve, reject) {
        aws.config.update({
            accessKeyId:accessKeyId ,
            secretAccessKey: secret,
            region: "ap-south-1"
        })
        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        let uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "TNAP/productManagement/" + files.originalname,
            Body: files.buffer
        }

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
        
            return resolve(data.Location)
        })
    })
}
module.exports = { uploadFile }