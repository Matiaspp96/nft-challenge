// import React from 'react'

import {
	useAddress,
	useDisconnect,
	useMetamask,
	useNFTDrop,
} from '@thirdweb-dev/react';
import { BigNumber } from 'ethers';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sanityClient, uriFor } from '../../sanity';
import { Collection } from '../../typings';
import toast, { Toaster } from 'react-hot-toast';

interface Props {
	collection: Collection;
}

const NFTDropPage = ({ collection }: Props) => {
	const [claimedSupply, setClaimedSupply] = useState<number>(0);
	const [totalSupply, setTotalSupply] = useState<BigNumber>();
	const [loading, setLoading] = useState<boolean>(true);
	const [price, setPrice] = useState<string>();
	const nftDrop = useNFTDrop(collection.address);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [tx, setTx] = useState<BigNumber>();
	const [nftMinted, setNftMinted] = useState<any>();

	// Auth
	const connectWithMetamask = useMetamask();
	const address = useAddress();
	const disconnect = useDisconnect();

	useEffect(() => {
		if (!nftDrop) return;

		const fetchPrice = async () => {
			const claimCondition = await nftDrop.claimConditions.getAll();
			setPrice(claimCondition?.[0].currencyMetadata.displayValue);
		};

		fetchPrice();
	}, [nftDrop]);

	useEffect(() => {
		if (!nftDrop) return;

		const fetchData = async () => {
			setLoading(true);
			const claimed = await nftDrop.getAllClaimed();
			const total = await nftDrop.totalSupply();

			setClaimedSupply(claimed.length);
			setTotalSupply(total);

			setLoading(false);
		};

		fetchData();
	}, [nftDrop]);

	const nftMint = () => {
		if (!nftDrop || !address) return;

		const quantity = 1;

		setLoading(true);

		const notification = toast.loading('Minting ...', {
			style: {
				background: 'white',
				color: 'green',
				fontWeight: 'bolder',
				fontSize: '17px',
				padding: '20px',
			},
		});

		nftDrop
			.claimTo(address, quantity)
			.then(async tx => {
				const receipt = tx[0].receipt;
				const claimedTokendId = tx[0].id;
				const claimedNFT = await tx[0].data();

				toast('Hooray... You Successfully Minted!', {
					duration: 8000,
					style: {
						background: 'green',
						color: 'white',
						fontWeight: 'bolder',
						fontSize: '17px',
						padding: '20px',
					},
				});
				console.log(receipt)
				setTx(claimedTokendId);
				setNftMinted(claimedNFT.metadata);
			})
			.catch(err => {
				console.log(err);
				toast.error('Upss... Something went wrong', {
					style: {
						background: 'red',
						color: 'white',
						fontWeight: 'bolder',
						fontSize: '17px',
						padding: '20px',
					},
				});
			})
			.finally(() => {
				setShowModal(true);
				setLoading(false);
				toast.dismiss(notification);
			});
	};

	return (
		<div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
			<Head>
				<title>NFT Drops</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			{/* Toaster */}
			<Toaster position='bottom-center' />
			{/* Modal */}
			{showModal && nftMinted && (
				<div className='fixed flex flex-col items-center justify-center z-50 w-full md:inset-0 h-modal md:h-full'>
					<div className='relative p-4 w-full max-w-md h-full md:h-auto'>
						<div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
							<div className='flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600'>
								<h3 className='text-xl font-medium text-gray-900 dark:text-white'>
									Drop of {collection.nftCollectionName}
								</h3>
								<button
									onClick={() => setShowModal(false)}
									type='button'
									className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white'
								>
									X
								</button>
							</div>
							<div className='flex flex-col items-center p-6 space-y-6'>
								<img
									className='w-44 rounded-xl object-cover lg:h-auto lg:w-72'
									src={nftMinted.image}
									alt=''
								/>
								<p className='text-base leading-relaxed text-gray-500 dark:text-gray-400'>
									{nftMinted.name} | {nftMinted.description}
								</p>
								<Link href={`https://rinkeby.etherscan.io/tx/${tx?._hex}`}>
									<p className='text-base leading-relaxed text-gray-500 dark:text-gray-400'>
										Transaction ID: {tx?._hex}
									</p>
								</Link>
							</div>
							<div className='flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600'>
								<button
									onClick={() => setShowModal(false)}
									type='button'
									className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
								>
									Cool
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Left */}
			<div className='lg:col-span-4 bg-gradient-to-tl from-cyan-400 to-indigo-400'>
				<div className='flex flex-col items-center justify-center py-2 lg:min-h-screen'>
					<div className='rounded-xl p-2 bg-gradient-to-br from-orange-300 to-purple-400'>
						<img
							className='w-44 rounded-xl object-cover lg:h-auto lg:w-72'
							src={uriFor(collection.mainImage).url()}
							alt=''
						/>
					</div>
					<div className='text-center p-5 space-y-2'>
						<h1 className='text-4xl font-bold text-white'>
							{collection.title}
						</h1>
						<h2 className='text-xl text-gray-200'>
							A {collection.title} who lives & breathe React!
						</h2>
					</div>
				</div>
			</div>
			{/* Right */}
			<div className='flex flex-1 flex-col p-12 lg:col-span-6'>
				{/* Header */}
				<header className='flex items-center justify-between'>
					<Link href={'/'}>
						<h1 className='w-52 cursor-pointer text-xl font-extralight sm:w-80 '>
							My{' '}
							<span className='font-extrabold underline decoration-pink-600/50'>
								Own
							</span>{' '}
							Market Place NFT
						</h1>
					</Link>

					<button
						onClick={() => (address ? disconnect() : connectWithMetamask())}
						className='rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base shadow-md'
					>
						{address ? 'Sign Out' : 'Sign In'}
					</button>
				</header>

				<hr className='my-2 border' />
				{address ? (
					<p className='text-center text-sm text-rose-400'>
						You&apos;re logged in with wallet {address.substring(0, 5)}...
						{address.substring(address.length - 5)}{' '}
					</p>
				) : (
					<div className='py-[0.63rem]' />
				)}
				{/* Content */}
				<div className='mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:justify-center lg:space-y-0'>
					<img
						className='w-80 object-cover pb-10 lg:h-56'
						src={uriFor(collection.previewImage).url()}
						alt=''
					/>
					<h1 className='text-3xl font-bold lg:text-5xl lg:font-extrabold'>
						{collection.title} | NFT Drop
					</h1>

					{loading ? (
						<p className='animate-pulse pt-2 text-xl text-green-500'>
							Loading Supply Count...
						</p>
					) : (
						<p className='pt-2 text-xl text-green-500'>
							{claimedSupply}/{totalSupply?.toString()} NFT&apos;s claimed
						</p>
					)}
				</div>
				{/* Mint Button */}
				<button
					onClick={nftMint}
					disabled={
						loading || claimedSupply === totalSupply?.toNumber() || !address
					}
					className='mt-4 h-16 w-full rounded-full bg-red-500/90 font-bold text-white shadow-md shadow-red-400 disabled:bg-red-200 disabled:cursor-not-allowed disabled:shadow-none hover:scale-[1.01] ease-in-out duration-300'
				>
					{loading ? (
						<div>Loading...</div>
					) : claimedSupply === totalSupply?.toNumber() ? (
						<div>Sold Out</div>
					) : !address ? (
						<div>Sign In to Mint</div>
					) : (
						<span>Mint NFT ({price} ETH)</span>
					)}
				</button>
			</div>
		</div>
	);
};

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const query = `*[_type == 'collection' && slug.current == $id][0]{
		_id,
		title,
		address,
		description,
		nftCollectionName,
		mainImage{
		  asset
		},
		previewImage{
		  asset
		},
		slug{
		  current
		},
		creator->{
		  _id,
		  name,
		  address,
		  slug {
			current
		  },
		},
	  }`;

	const collection = await sanityClient.fetch(query, {
		id: params?.id,
	});

	if (!collection) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			collection,
		},
	};
};
