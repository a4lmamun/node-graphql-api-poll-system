import { CurrentDateTime } from './../utils/functions';
import { GetCache, SetCache } from './cache';
import { InsertPoll, RequestActivePoll, RequestPoll, RequestPolls, SubmitVote, UpdatePoll } from './queries';
import { Poll, Vote } from '../utils/type';

export const GetPolls = async (take: number, skip: number) => {
	const key = 'gql-polls-' + take + '-' + skip;
	const data = await GetCache(key);
	if (data) {
		return data;
	} else {
		const data = await RequestPolls(take, skip);
		await SetCache(key, data, 1800); //30 Minutes
		return data;
	}
};

export const GetPoll = async (id: string) => {
	const key = 'gql-poll-' + id;
	const data = await GetCache(key);
	if (data) {
		return data;
	} else {
		const data = await RequestPoll(id);
		await SetCache(key, data, 1800); //30 Minutes
		return data;
	}
};

export const GetActivePoll = async () => {
	const key = 'gql-active-poll';
	const data = await GetCache(key);
	//check if cache exists and exists data endDate value is greater than current date
	if (data && data.endDate > CurrentDateTime()) {
		return data;
	} else {
		const data = await RequestActivePoll();
		await SetCache(key, data, 1800); //30 Minutes
		return data;
	}
};

export const CreatePoll = async (poll: Poll) => {
	return await InsertPoll(poll);
};

export const ModifyPoll = async (poll: Poll) => {
	return await UpdatePoll(poll);
};

export const CastVote = async (vote: Vote) => {
	return await SubmitVote(vote);
};
