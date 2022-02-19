import styles from './index.module.sass'
import type {NextPage} from 'next';
import {useState} from 'react';
import Messages from './Messages/Messages';
import SendChats from './Tabs/SendChats';

const Home: NextPage = () => {
	const [tab, setTab] = useState<'messages' | 'chats'>('messages');
	const tabs: ['messages', 'chats'] = ['messages', 'chats'];
	const renderTabs = () => {
		return tabs.map((caption, key) => {
			return (
				<span className={styles.tab  + (tab === caption ? ' ' + styles._active : '')} key={key} onClick={() => setTab(caption)}>
					{caption === 'messages' ? 'Сообщения' : 'Чаты и настройки'}
				</span>
			);
		})
	};

	return (
		<div>
			<div className={styles.tab__box}>{renderTabs()}</div>
			{tab === 'messages' ? <Messages/> : <SendChats/>}
		</div>
	);
};

export default Home;
