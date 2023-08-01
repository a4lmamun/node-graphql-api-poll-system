import { CastVote, CreatePoll, GetActivePoll, GetPoll, GetPolls, ModifyPoll } from '../data';
import { Poll, Vote } from '../utils/type';

export const typeDefs = `#graphql
	type Poll {
		id: String
		image: String
		question: String
		options: [Option]
		votes: [Vote]
		startDate: String
		endDate: String
	}

	type Option {
		id: String
		text: String
	}

	type Vote {
		id: String
		poll: Poll
		option: Option
	}

	type Query {
		polls(take: Int!, skip: Int!): [Poll!]!
		activePoll: Poll
		poll(id: String!): Poll
	}

	type Mutation {
		createPoll(question: String!, options: [String!]!, startDate: String!, endDate: String!, imagePath: String): Poll!
		updatePoll(id: String!, question: String, options: [String], startDate: String, endDate: String): Poll!
		vote(pollId: String!, optionId: String!): Vote!
	}
`;

export const resolvers = {
	Query: {
		polls: async (_: any, { take, skip }: { take: number; skip: number }) => {
			return await GetPolls(take, skip);
		},
		poll: async (_: any, { id }: { id: string }) => {
			return await GetPoll(id);
		},
		activePoll: async () => {
			return await GetActivePoll();
		},
	},
	Mutation: {
		createPoll: async (_: any, poll: Poll) => {
			return await CreatePoll(poll);
		},
		updatePoll: async (_: any, poll: Poll) => {
			return await ModifyPoll(poll);
		},
		vote: async (_: any, vote: Vote) => {
			return await CastVote(vote);
		},
	},
};
