import type {NextPage} from 'next';
import {Messages} from './Messages/Messages';

const Home: NextPage = () => {
	return (
		<div>
			<Messages/>
		</div>
	);
};

export default Home;
