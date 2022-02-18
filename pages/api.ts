const toJson = (res: Response) => res.json();

export type GetArrayType<T> = T extends (infer U)[] ? U : never

export type SingleMessage = GetArrayType<GetMessagesResponse['getMessages']>

export interface SendMessagesResponse {
	sendMessages: SingleMessage;
}

export interface GetMessagesResponse {
	getMessages: {
		id: number
		ruText: string
		engText: string
		createdAt: number
		updatedAt: number
		canBeSend: boolean
		isSent: boolean
	}[];
}

export const fetch_updateMessage = async (id: number, ruText: string, engText: string) => {
	const body: BodyInit = JSON.stringify({
		query: `mutation {
			updateMessage(id: ${id}, ruText: "${ruText.replace('\n', '\\n')}", engText: "${engText.replace('\n', '\\n')}") {
				id
				ruText
			    engText
			    createdAt
			    updatedAt
			    canBeSend
			    isSent
			}
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as { updateMessage: SingleMessage };
};
export const fetch_deleteMessage = async (id: number) => {
	const body: BodyInit = JSON.stringify({
		query: `mutation {
			deleteMessage(id: ${id})
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as { deleteMessage: boolean };
};

export const fetch_sendMessage = async (id: number, canBeSend: boolean = true) => {
	const body: BodyInit = JSON.stringify({
		query: `mutation {
			sendMessage(id: ${id}, canBeSend: ${canBeSend}) {
				id
				ruText
			    engText
			    createdAt
			    updatedAt
			    canBeSend
			    isSent
			}
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as SendMessagesResponse;
};

export const fetch_getMessages = async () => {
	const body: BodyInit = JSON.stringify({
		query: `{
			getMessages {
				id
				ruText
			    engText
			    createdAt
			    updatedAt
			    canBeSend
			    isSent
			}
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as GetMessagesResponse;
};

export interface GetSendChatsResponse {
	getSendChats: {
		id: string
		tgChatId: string
		listen: string
	}[];
}

export const fetch_deleteSendChat = async (tgChatId: string) => {
	const body: BodyInit = JSON.stringify({
		query: `mutation {
			deleteSendChat (tgChatId: "${tgChatId}")
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as {
		createSendChat: GetArrayType<GetSendChatsResponse['getSendChats']>
	};
};

export const fetch_createSendChat = async (tgChatId: string) => {
	const body: BodyInit = JSON.stringify({
		query: `mutation {
			createSendChat(tgChatId: "${tgChatId}") {
				id
				tgChatId
			    listen
			}
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as {
		createSendChat: GetArrayType<GetSendChatsResponse['getSendChats']>
	};
};

export const fetch_getSendChats = async () => {
	const body: BodyInit = JSON.stringify({
		query: `{
			getSendChats {
				id
				tgChatId
			    listen
			}
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as GetSendChatsResponse;
};

interface UserSettingsResponse {
	userSettings: {
		sendImmediately: boolean
	};
}

export const fetch_updateSendImmediately = async (sendImmediately: boolean) => {
	const body: BodyInit = JSON.stringify({
		query: `mutation {
			updateSendImmediately (sendImmediately: ${sendImmediately}) {
				sendImmediately
			}
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as { updateSendImmediately: {sendImmediately: boolean} };
};

export const fetch_userSettings = async () => {
	const body: BodyInit = JSON.stringify({
		query: `{
			userSettings {
				sendImmediately
				id
			}
		}`,
	});
	const {data} = await fetch('http://127.0.0.1:2000/graphql', {
		method: 'POST',
		headers: {'Content-Type': 'application/json;charset=utf-8'},
		body,
	}).then(toJson);

	return data as UserSettingsResponse;
};