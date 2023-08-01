import redisClient from '../clients/redis';

export const SetCache = async (key: string, data: any, seconds: number) => {
	await redisClient.set(key, Buffer.from(JSON.stringify(data)), {
		EX: seconds,
	});
};

export const RemoveCache = async (key: string) => {
	await redisClient.del(key);
};

export const GetCache = async (key: string) => {
	const data = await redisClient.get(key);
	if (data) {
		return JSON.parse(data.toString());
	}

	return '';
};
