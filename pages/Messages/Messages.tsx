import React, {PureComponent} from 'react'
import {
	fetch_deleteMessage,
	fetch_getMessages,
	fetch_sendMessage,
	fetch_updateMessage,
	GetMessagesResponse,
	SingleMessage,
} from '../api'
import css from './styles.module.sass'

interface MessagesState {
	activeTab: number
	editingId: number | null
	ruText: string | null
	engText: string | null
}

export default class Messages extends PureComponent<unknown, MessagesState> {
	private readonly _tabs = ['Ждут обработки', 'Отправленные', 'В очереди на отправление']

	constructor(props: unknown) {
		super(props)
		this.state = {activeTab: 0, editingId: null, ruText: null, engText: null}
	}

	private _messages: SingleMessage[] = []
	private _sentMessages: SingleMessage[] = []
	private _waitingForSendingMessages: SingleMessage[] = []
	private _mounted = false
	private _intervalId: number | undefined

	componentDidMount() {
		this._mounted = true
		this.refreshMessages()
			.finally(this.setInterval)
	}

	private clearInterval = () => this._intervalId && window.clearInterval(this._intervalId)

	private setInterval = () => {
		this.clearInterval()
		this._intervalId = window.setTimeout(async () => {
			this.refreshMessages()
				.finally(this.setInterval)
		}, 2000)
	}

	private refreshMessages = async () => {
		this._messages = []
		this._sentMessages = []
		this._waitingForSendingMessages = []
		const messages = await fetch_getMessages()
		this.setMessages(messages)
	}

	componentWillUnmount() {
		this._mounted = false
		this.clearInterval()
	}

	forceUpdate = (callback?: () => void) => {
		if (this._mounted) super.forceUpdate(callback)
	}

	private setMessages = (res: GetMessagesResponse) => {
		if (Array.isArray(res?.getMessages)) {
			res.getMessages.sort((m1, m2) => m1.id - m2.id).forEach(m => {
				if (m.isSent) this._sentMessages.push(m)
				else if (m.canBeSend) this._waitingForSendingMessages.push(m)
				else this._messages.push(m)
			})
		}
		this.forceUpdate()
	}

	private deleteMessage = async (id: number) => {
		if (this.state.editingId) return
		try {
			const res = await fetch_deleteMessage(id)
			if (res.deleteMessage) {
				if (this.state.activeTab === 0) {
					this._messages = this._messages.filter(m => m.id !== id)
				} else if (this.state.activeTab === 1) {
					this._sentMessages = this._sentMessages.filter(m => m.id !== id)
				} else if (this.state.activeTab === 2) {
					this._waitingForSendingMessages = this._waitingForSendingMessages.filter(m => m.id !== id)
				}
				this.forceUpdate()
			}
		} catch (e) {
			console.error('ошибка в deleteMessage', e)
		}
	}

	private sendMessage = async (id: number, canBeSend: boolean = true) => {
		if (this.state.editingId) return
		try {
			await fetch_sendMessage(id, canBeSend)
			await this.refreshMessages()
		} catch (e) {
			console.error('ошибка в sendMessage', e)
		}
	}

	private doEdit = async () => {
		const {ruText, engText, editingId} = this.state
		if (!editingId) return null
		try {
			console.log(String(ruText), engText, editingId)
			await fetch_updateMessage(editingId, ruText ?? '', engText ?? '')
			await this.refreshMessages()
		} catch (e) {
			console.error('Ошибка в обработчике doEdit', e)
		}
		this.setState({editingId: null, ruText: null, engText: null})
	}

	private startEdit = (id: number) => {
		let message: SingleMessage | undefined
		if (this.state.activeTab === 0) {
			message = this._messages.find(m => m.id === id)
		} else if (this.state.activeTab === 1) {
			message = this._sentMessages.find(m => m.id === id)
		} else if (this.state.activeTab === 2) {
			message = this._waitingForSendingMessages.find(m => m.id === id)
		}

		if (message) {
			this.setState({
				editingId: id,
				ruText: message.ruText,
				engText: message.engText,
			})
		}
	}

	private renderSingleMessage = (s: SingleMessage, key: number) => {
		return (
			<div className={css.Messages__single} key={key}>
				<span className={css.Messages__singleTitle}>Сообщение id: {s.id}</span>
				<div className={css.Messages__singleTitle}>Текст на русском языке:</div>
				{this.state.editingId === s.id
					? <textarea className={css.Messages__textArea} value={this.state.ruText ?? ''} onChange={e => {
						this.setState({ruText: e.target.value})
					}}/>
					: <div className={css.Messages__singleText}>{s.ruText}</div>
				}
				<div className={css.Messages__singleTitle}>Текст на английском языке:</div>
				{this.state.editingId === s.id
					? <textarea className={css.Messages__textArea} value={this.state.engText ?? ''}
					            onChange={e => this.setState({engText: e.target.value})}/>
					: <div className={css.Messages__singleText}>{s.engText}</div>
				}
				<div className={css.Messages__singleButtons}>
					{this.state.editingId === null || this.state.editingId !== s.id
						? <span
							className={css.Messages__singleEdit}
							onClick={() => this.startEdit(s.id)}
						>
							Редактировать
						</span>
						: <span className={css.Messages__singleEdit} onClick={() => this.doEdit()}>Сохранить</span>
					}
					<span className={css.Messages__singleDelete + ((this.state.editingId) ? ` ${css._disabled}` : '')}
					      onClick={() => this.deleteMessage(s.id)}>Удалить</span>
					{this.state.activeTab === 0
						?
						<span className={css.Messages__singleSend + ((this.state.editingId) ? ` ${css._disabled}` : '')}
						      onClick={() => this.sendMessage(s.id)}>Отправить</span>
						: this.state.activeTab === 1
							? null
							: this.state.activeTab === 2
								? <span
									className={css.Messages__singleSend + ((this.state.editingId) ? ` ${css._disabled}` : '')}
									onClick={() => this.sendMessage(s.id, false)}>Отменить отправку</span>
								: null
					}
				</div>
			</div>
		)
	}

	private renderMessages = () => {
		let messages: SingleMessage[] = []
		if (this.state.activeTab === 0) {
			messages = this._messages
		} else if (this.state.activeTab === 1) {
			messages = this._sentMessages
		} else if (this.state.activeTab === 2) {
			messages = this._waitingForSendingMessages
		}

		return (
			<div className={css.Messages__box}>
				{messages.length
					? messages.map(this.renderSingleMessage)
					: <span className={css.Messages__emptyList}>Список &quot;{this._tabs[this.state.activeTab]}&quot; пуст</span>
				}
			</div>
		)
	}

	private renderTabs = () => {
		return (
			<div className={css.Messages__tabsBox}>
				{this._tabs.map((tab, activeTab) => {
					let count: number | null = null
					if (activeTab === 0) {
						count = this._messages.length
					} else if (activeTab === 1) {
						count = this._sentMessages.length
					} else if (activeTab === 2) {
						count = this._waitingForSendingMessages.length
					}
					return (
						<div key={activeTab}
						     className={css.Messages__tab + (activeTab === this.state.activeTab ? ` ${css._active}` : '')}
						     onClick={() => this.setState({activeTab, editingId: null})}
						>
							{tab}
							{!!count && ' '}
							{!!count && '(' + String(count) + ')'}
						</div>
					)
				})}
			</div>
		)
	}

	render() {
		return (
			<div className={css.Messages}>
				{this.renderTabs()}
				{this.renderMessages()}
			</div>
		)
	}
}
