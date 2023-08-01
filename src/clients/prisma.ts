import { PrismaClient } from '@prisma/client';
import { DateFormat } from '../utils/functions';

export const prisma = new PrismaClient();

export const xprisma = prisma.$extends({
	result: {
		poll: {
			startDate: {
				needs: { startDate: true },
				compute(poll) {
					return DateFormat(poll.startDate.toString());
				},
			},
			endDate: {
				needs: { endDate: true },
				compute(poll) {
					return DateFormat(poll.endDate.toString());
				},
			},
			createdAt: {
				needs: { createdAt: true },
				compute(poll) {
					return DateFormat(poll.createdAt.toString());
				},
			},
			updatedAt: {
				needs: { updatedAt: true },
				compute(poll) {
					return DateFormat(poll.updatedAt.toString());
				},
			},
		},
	},
});