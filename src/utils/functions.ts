import moment from 'moment-timezone';
import fs from 'fs';
import { s3Client } from '../clients/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

export const CurrentDateTime = (format: string = 'YYYY-MM-DD HH:mm:ss') => {
	return moment.tz('Asia/Dhaka').format(format);
};

export const CurrentDate = () => {
	console.log(moment.tz('Asia/Dhaka').toDate());
	return moment.tz('Asia/Dhaka').toDate();
};

export const DateFormat = (date: string, format: string = 'YYYY-MM-DD HH:mm:ss') => {
	return moment.tz(new Date(date), 'Asia/Dhaka').format(format);
};

export const DateFormatISO = (date: string) => {
	return moment.tz(date, 'Asia/Dhaka').toISOString();
};

export const CurrentISO = () => {
	return moment.utc().tz('Asia/Dhaka').toISOString();
};

export const uploadFileToS3 = async (key: string, filePath: string): Promise<void> => {
	const mimeType = mime.lookup(filePath) || 'image/jpeg';
	const fileStream = fs.createReadStream(filePath);
	const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
		const chunks: any[] = [];
		fileStream.on('data', (chunk) => chunks.push(chunk));
		fileStream.on('end', () => resolve(Buffer.concat(chunks)));
		fileStream.on('error', (error) => reject(error));
	});

	const params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: key,
		Body: imageBuffer,
		ContentType: mimeType,
	};

	try {
		await s3Client.send(new PutObjectCommand(params));
		console.log(`File uploaded successfully to S3 at: s3://${process.env.AWS_BUCKET_NAME}/${key}`);
	} catch (error) {
		console.error('Error uploading file to S3:', error);
		throw error;
	}
};
