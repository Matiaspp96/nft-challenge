import type { NextPage } from 'next';
import Head from 'next/head';
// import Image from 'next/image';

const Home: NextPage = () => {
	return (
		<div>
			<Head>
				<title>NFT Drops</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<h1 className='text-4xl font-bold text-purple-400'>
				Welcome to the NFT Drop Challenge
			</h1>
		</div>
	);
};

export default Home;
