import path from 'path';
import { prisma, xprisma } from '../clients/prisma';
import { CurrentDate, CurrentISO, DateFormatISO, uploadFileToS3 } from '../utils/functions';
import { Poll, Vote } from '../utils/type';
import { RemoveCache } from './cache';

export const RequestPolls = async (take: number, skip: number) => {
	return await xprisma.poll.findMany({
		include: {
			options: true,
			votes: true,
		},
		take,
		skip,
		orderBy: {
			createdAt: 'desc',
		},
	});
};

export const RequestPoll = async (id: string) => {
	return await xprisma.poll.findUnique({
		where: { id },
		include: {
			options: true,
			votes: {
				include: {
					option: true,
				},
			},
		},
	});
};

export const RequestActivePoll = async () => {
	return await xprisma.poll.findFirst({
		where: { startDate: { lte: CurrentISO() }, endDate: { gte: CurrentISO() } },
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			options: true,
			votes: true,
		},
	});
};

export const InsertPoll = async ({ question, options, startDate, endDate, imagePath }: Poll) => {
	const imageFileName = path.basename(imagePath);
	const currentTimestamp = Date.now();
	const imageKey = `media/poll_images/${currentTimestamp}-${imageFileName}`;

	try {
		await uploadFileToS3(imageKey, imagePath);

		const createdPoll = await xprisma.poll.create({
			data: {
				question,
				options: { create: options.map((text) => ({ text })) },
				startDate: DateFormatISO(startDate),
				endDate: DateFormatISO(endDate),
				image: imageKey,
			},
			include: {
				options: true,
			},
		});

		return createdPoll;
	} catch (error) {
		console.error('Error uploading image to S3 or creating poll:', error);
		throw error;
	}
};

export const UpdatePoll = async ({ id, question, options, startDate, endDate }: Poll) => {
	const existingPoll = await prisma.poll.findUnique({
		where: {
			id,
		},
	});

	if (!existingPoll) {
		throw new Error('Poll not found or');
	}

	if (existingPoll.startDate <= CurrentDate()) {
		throw new Error(`Started poll can't be edited`);
	}

	let data: {
		question?: string;
		options?: {
			deleteMany: {};
			create: {
				text: string;
			}[];
		};
		startDate?: string;
		endDate?: string;
	} = {};

	if (question) {
		data.question = question;
	}
	if (options) {
		data.options = {
			deleteMany: {},

			create: options.map((text) => ({ text })),
		};
	}
	if (startDate) {
		data.startDate = DateFormatISO(startDate);
	}
	if (endDate) {
		data.endDate = DateFormatISO(endDate);
	}

	const updatedPoll = await xprisma.poll.update({
		where: { id },
		data,
		include: {
			options: true,
		},
	});

	RemoveCache('gql-poll-' + id);

	return updatedPoll;
};

export const SubmitVote = async ({ pollId, optionId }: Vote) => {
	const vote = await prisma.vote.create({
		data: {
			pollId,
			optionId,
		},
		include: { poll: true, option: true },
	});

	RemoveCache('gql-poll-' + pollId);

	return vote;
};
