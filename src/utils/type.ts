export type Poll = {
	id?: string;
	question: string;
	options: string[];
	startDate: string;
	endDate: string;
	imagePath: string;
};

export type Vote = {
	pollId: string;
	optionId: string;
};
