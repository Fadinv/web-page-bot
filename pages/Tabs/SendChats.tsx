import React, {PureComponent} from 'react';
import styles from './styles.module.sass';
import {
	fetch_createSendChat,
	fetch_deleteSendChat,
	fetch_getSendChats, fetch_updateSendImmediately,
	fetch_userSettings,
	GetSendChatsResponse,
} from '../api';

interface SendChatsState {
	addValue: string;
	userSettings: {
		sendImmediately: boolean;
	};
}

export default class SendChats extends PureComponent<unknown, SendChatsState> {
	private _chats: GetSendChatsResponse['getSendChats'] | null = null;
	private _mounted = false;

	constructor(props: unknown) {
		super(props);
		this.state = {addValue: '', userSettings: {sendImmediately: false}};
	}

	forceUpdate = (callback?: () => void) => {
		if (this._mounted) super.forceUpdate(typeof callback === 'function' ? callback : undefined);
	};

	componentDidMount() {
		this._mounted = true;
		fetch_getSendChats()
			.then(async (res) => {
				if (res === null) {
					this._chats = null;
				} else if (res.getSendChats) {
					this._chats = res.getSendChats;
				}
				await fetch_userSettings()
					.then(res => {
						this.setState({userSettings: res.userSettings});
					});
				this.forceUpdate();
			});
	}

	private deleteSendChat = async (tgChatId: string) => {
		const bool = await fetch_deleteSendChat(tgChatId);
		if (bool && this._chats) {
			this._chats = this._chats.filter((el) => el.tgChatId !== tgChatId);
		}
		this.forceUpdate();
	};

	private createSendChat = async (tgChatId: string) => {
		const res = await fetch_createSendChat(tgChatId);
		if (!this._chats) this._chats = [];
		this._chats.push(res.createSendChat);
		this.forceUpdate();
	};

	renderSendSettings = () => {
		return (
			<div className={styles.SendChats__updateSendImmediatelyBox}>
				<input
					type={'checkbox'}
					checked={this.state.userSettings.sendImmediately}
					value={'Отправлять сразу'}
					onChange={async (e) => {
						const response = await fetch_updateSendImmediately(e.target.checked)
						this.setState({userSettings: response.updateSendImmediately});
					}}
				/>
				<div>
					Отправлять сообщения сразу
				</div>
			</div>
		);
	};

	renderCreateChat = () => {
		return (
			<div className={styles.SendChats__addChatIdBox}>
				<div>Добавить чат через telegram ID</div>
				<div>
					<input
						onChange={(e) => this.setState({addValue: e.target.value})}
						value={this.state.addValue}
					/>
					<button
						disabled={!this.state.addValue}
						onClick={() => this.createSendChat(this.state.addValue)}
					>
						Добавить
					</button>
				</div>
			</div>
		);
	};

	componentWillUnmount() {
		this._mounted = false;
	}

	private renderChats = () => {
		return this._chats?.map((chat, key) => {
			return (
				<div key={key}>
					<div>
						Telegram chat id: {chat.tgChatId}
					</div>
					<div>
						{chat.listen ? 'Прослушивается' : 'Не прослушивается'}
					</div>
					<button onClick={() => this.deleteSendChat(chat.tgChatId)}>
						Удалить
					</button>
				</div>
			);
		});
	};

	render() {
		return (
			<div className={styles.SendChats}>
				{this.renderSendSettings()}
				{this.renderCreateChat()}
				{this.renderChats()}
			</div>
		);
	}
}
