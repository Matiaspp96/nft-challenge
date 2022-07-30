// import React from 'react'

import { useAddress, useDisconnect, useMetamask } from '@thirdweb-dev/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { sanityClient, uriFor } from '../../sanity';
import { Collection } from '../../typings';

interface Props {
	collection: Collection;
}

const NFTDropPage = ({ collection }: Props) => {
	// Auth
	const connectWithMetamask = useMetamask();
	const address = useAddress();
	const disconnect = useDisconnect();

	return (
		<div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
			{/* Left */}
			<div className='lg:col-span-4 bg-gradient-to-tl from-cyan-400 to-indigo-400'>
				<div className='flex flex-col items-center justify-center py-2 lg:min-h-screen'>
					<div className='rounded-xl p-2 bg-gradient-to-br from-orange-300 to-purple-400'>
						<img
							className='w-44 rounded-xl object-cover lg:h-96 lg:w-72'
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
						className='w-80 object-cover pb-10 lg:h-48'
						src={uriFor(collection.previewImage).url()}
						alt=''
					/>
					<h1 className='text-3xl font-bold lg:text-5xl lg:font-extrabold'>
						{collection.title} | NFT Drop
					</h1>

					<p className='pt-2 text-xl text-green-500'>
						15/40 NFT&apos;s claimed
					</p>
				</div>
				{/* Mint Button */}
				<button className='mt-10 h-16 w-full rounded-full bg-red-500/90 font-bold text-white shadow-md'>
					Mint NFT (0.01 ETH)
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
