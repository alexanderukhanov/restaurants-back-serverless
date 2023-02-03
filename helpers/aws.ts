import * as AWS from "aws-sdk";
import { ObjectIdentifierList } from "aws-sdk/clients/s3";

const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    credentials: {
        accessKeyId: String(process.env.ACCESS_KEY),
        secretAccessKey: String(process.env.SECRET_ACCESS_KEY),
    }
});

export const db = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    credentials: {
        accessKeyId: String(process.env.ACCESS_KEY),
        secretAccessKey: String(process.env.SECRET_ACCESS_KEY),
    }
});

export const saveFileFromBase64 = async (base64: string, entityName: string) => {
    try {
        const base64Image = base64.split(';base64,');
        const fileExtension = base64Image[0].split('/')[1] || 'jpeg';
        const fileName = `${Date.now()}-${entityName}.${fileExtension}`;

        const buf = Buffer.from(base64Image[1],'base64');

        const { Location } = await s3.upload({
            Bucket: 'restaurants-serverless-assets',
            Key: fileName,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: `image/${fileExtension}`
        }).promise();

        return Location;
    } catch (e) {
        return String(e)
    }
}

export const deleteFilesFromS3 = async (Objects: ObjectIdentifierList) => (
    Objects.length && s3.deleteObjects({
        Bucket: 'restaurants-serverless-assets',
        Delete: { Quiet: true, Objects },
    }).promise()
);
